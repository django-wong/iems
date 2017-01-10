'use strict';
var Vue = require('vue');
var iView = require('iview');
var VueRouter = require('vue-router');
var routes = require('./router.js');
var Services = require('./services.js');

window.axios = require('axios');
window.gravatar = require('gravatar.js');

Vue.use(iView);
Vue.use(VueRouter);
Vue.use(Services);

let options = Vue.extend({});
let router = new VueRouter();

router.map(routes);
router.start(options, 'body');