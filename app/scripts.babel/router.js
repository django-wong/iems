/*
* @Author: Django Wong
* @Date:   2017-01-09 02:07:47
* @Last Modified by:   Django Wong
* @Last Modified time: 2017-01-10 23:20:21
* @File Name: router.js
*/

'use strict';

var pages = {};
pages.index = require('../templates/index.vue');
pages.dashboard = require('../templates/dashboard.vue');
pages.show = require('../templates/show.vue');
pages.account = require('../templates/account.vue');

module.exports = {
	'/account': {
		component: pages.account
	},

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