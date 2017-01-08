/*
* @Author: Django Wong
* @Date:   2017-01-09 02:07:47
* @Last Modified by:   Django Wong
* @Last Modified time: 2017-01-09 03:04:33
* @File Name: router.js
*/

'use strict';

var pages = {};
pages.index = require('../templates/index.vue');
pages.dashboard = require('../templates/dashboard.vue');

module.exports = {
	'/dashboard': {
		component: pages.dashboard
	},

	'/' : {
		component: pages.index
	},

	'*' : {
		component: pages.index
	}
};