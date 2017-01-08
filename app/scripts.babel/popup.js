'use strict';
var Vue = require('vue');
var iView = require('iview');
var VueRouter = require('vue-router');
var routes = require('./router.js');

Vue.use(iView);
Vue.use(VueRouter);

let App = Vue.extend({});

chrome.browserAction.setBadgeText({text: ''});

let router = new VueRouter();
router.map(routes);
router.start(App, 'body');