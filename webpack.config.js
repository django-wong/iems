/*
* @Author: Django Wong
* @Date:   2017-01-08 22:46:00
* @Last Modified by:   django-wong
* @Last Modified time: 2017-09-19 22:17:20
* @File Name: webpack.config.js
*/

'use strict';
module.exports = {
	output: {
		filename: '[name].js'
	},
	module: {
		loaders: [
			{
				test: /\.vue$/,
				loader: 'vue',
				query: {
				presets: ['es2015', 'es2017'],
					plugins: [
						'transform-runtime',
						'syntax-async-functions',
						'transform-regenerator'
					]
				}
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				loaders: [
					'url-loader'
				]
			}
		]
	},
	babel: {
		presets: ['es2015', 'es2017'],
		plugins: [
			'transform-runtime',
			'syntax-async-functions',
			'transform-regenerator'
		]
	},
	node: {
		child_process: 'empty',
		fs: 'empty'
	}
};