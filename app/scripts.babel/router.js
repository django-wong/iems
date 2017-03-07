/*
* @Author: Django Wong
* @Date:   2017-01-09 02:07:47
* @Last Modified by:   Django Wong
* @Last Modified time: 2017-03-07 17:11:54
* @File Name: router.js
*/

'use strict';

var pages = {};
pages.index = require('../templates/index.vue');
pages.dashboard = require('../templates/dashboard.vue');
pages.show = require('../templates/show.vue');
pages.account = require('../templates/account.vue');
pages.alarm = require('../templates/alarm.vue');
pages.preference = require('../templates/preference.vue');

module.exports = {
	'/preference/:id': {
		component: pages.preference
	},

	'/alarm': {
		component: pages.alarm
	},

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