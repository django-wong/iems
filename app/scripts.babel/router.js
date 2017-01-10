/*
* @Author: Django Wong
* @Date:   2017-01-09 02:07:47
* @Last Modified by:   Django Wong
* @Last Modified time: 2017-01-10 03:01:37
* @File Name: router.js
*/

'use strict';

var pages = {};
pages.index = require('../templates/index.vue');
pages.dashboard = require('../templates/dashboard.vue');
pages.show = require('../templates/show.vue');
module.exports = {
	'/dashboard': {
		component: pages.dashboard
	},

	'/show/:id': {
		component: pages.show
	},

	'/' : {
		component: pages.index
	},

	'*' : {
		component: pages.index
	}
};