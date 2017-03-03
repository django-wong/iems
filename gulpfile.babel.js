// generated on 2017-01-08 using generator-chrome-extension 0.6.1
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import {stream as wiredep} from 'wiredep';
import webpack from 'webpack-stream';
import named from 'vinyl-named';

const $ = gulpLoadPlugins();

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/styles/fonts/*',
    'app/styles/main.css',
    'app/_locales/**',
    'app/scripts/popup.js',
    '!app/scripts.babel',
    '!app/scripts.temp',
    '!app/*.json',
    '!app/*.html',
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest('dist'));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format());
  };
}

gulp.task('lint', lint('app/scripts.babel/**/*.js', {
  env: {
    es6: true
  }
}));

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('html',  () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.sourcemaps.init())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
    .pipe($.sourcemaps.write())
    .pipe($.if('*.html', $.htmlmin({removeComments: true, collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      buildnumber: true,
      background: {
        target: 'scripts/background.js',
        exclude: [
          'scripts/chromereload.js'
        ]
      }
  }))
  .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
  .pipe($.if('*.js', $.sourcemaps.init()))
  .pipe($.if('*.js', $.uglify()))
  .pipe($.if('*.js', $.sourcemaps.write('.')))
  .pipe(gulp.dest('dist'));
});

gulp.task('babel', () => {
  del.bind(null, ['app/scripts.temp']);
  return gulp.src('app/scripts.babel/**/*.js')
      .pipe($.babel({
        presets: ['es2015', 'es2017'],
        plugins: ['transform-runtime', 'syntax-async-functions', 'transform-regenerator']
      }))
      .pipe(gulp.dest('app/scripts.temp'));
});

gulp.task('webpack', ['babel'], () => {
  return gulp.src('app/scripts.temp/**/*.js')
      .pipe(named())
      .pipe(webpack(require('./webpack.config.js')))
      .pipe(gulp.dest('app/scripts'))
      .on('end', function(){
        del(['app/scripts.temp']);
      });
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist', 'app/scripts.temp', 'app/styles.temp']));

gulp.task('watch', ['lint', 'style', 'webpack'], () => {
  $.livereload.listen();

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/styles/**/*',
    'app/templates/**/*',
    'app/_locales/**/*.json'
  ]).on('change', $.livereload.reload);

  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'webpack']);
  gulp.watch('app/templates/**/*.vue', ['lint', 'webpack']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('less', function(){
    return gulp.src('app/styles/less/main.less')
      .pipe($.less())
      .pipe(gulp.dest('app/styles.temp'));
});

gulp.task('css', function(){
  return gulp.src('node_modules/metrics-graphics/dist/metricsgraphics.css')
    .pipe(gulp.dest('app/styles.temp'));
});

gulp.task('style', ['less', 'css'], () => {
  return gulp.src([
      'app/styles.temp/metricsgraphics.css',
      'app/styles.temp/main.css'
    ])
    .pipe($.concat('main.css'))
    .pipe(gulp.dest('app/styles'))
    .on('end', function(){
      del(['app/styles.temp']);
    });
});

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('wiredep', () => {
  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('package', function () {
  var manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
      .pipe($.zip('iems-' + manifest.version + '.zip'))
      .pipe(gulp.dest('package'));
});

gulp.task('build', (cb) => {
  runSequence(
    'lint', 'style', 'webpack', 'chromeManifest',
    ['html', 'images', 'extras'],
    'size', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});
