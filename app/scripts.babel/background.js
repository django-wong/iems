'use strict';

var i18n = window.i18n = chrome.i18n.getMessage;
var qs = require('query-string');
var moment = require('moment');
require('moment-transform');
var imagePath = chrome.extension.getURL('images');
var Services = require('./services.js').init({});

chrome.runtime.onMessage.addListener(function(message, sender, callback){
	if(typeof message === 'object' && message.handler){
		let event = new CustomEvent(message.handler, {
			detail: message.detail,
			callback: callback,
			sender: sender
		});
		window.dispatchEvent(event);
	}else{
		if(typeof callback === 'function'){
			callback({
				detail: message
			});
		}
	}
});

chrome.alarms.onAlarm.addListener(function(alarm){
	console.info(`on alarm: ${alarm.name}`);
	let event = new CustomEvent(alarm.name, {
		detail: alarm
	});
	window.dispatchEvent(event);
});

window.addEventListener('mailto', function(event){
	var mail = event.detail;
	var address = function(a){
		return Array.isArray(a) ? a.join(',') : a || '';
	};
	let to = address(mail.to);
	delete mail.to;
	let query = qs.stringify(mail);

	let url = `mailto:${to}?${query}`;

	chrome.tabs.create({ url: url }, function(tab) {
		setTimeout(function() {
			chrome.tabs.remove(tab.id);
		}, 500);
	});
});


window.addEventListener('scheduled-apply', function(){
	chrome.storage.local.get(['alarm.enabled', 'alarm.scheduledAt'], async function(items){
		// Preliminary checks
		let enabled = items['alarm.enabled'];
		let scheduledAt = moment(items['alarm.scheduledAt']);
		if(!enabled || !scheduledAt.isValid()){
			return;
		}

		let today = moment().format('YYYYMMDD');
		let result = await Services.Utility.holidayOnDate(today);
		let inHistories = await Services.History.inAutoApplyHistories(today);
		
		if(inHistories){
			console.info('Already applied today');
			return;
		}

		/**
		 * Show a notify quickly
		 * @param  {string} message 
		 * @return {void}
		 */
		var notify = function(message){
			chrome.notifications.create('test-message', {
				type: chrome.notifications.TemplateType.BASIC,
				title: 'IEMS Jetpack',
				message: `${message} \n`,
				iconUrl: `${imagePath}/icon-128.png`
			}, function(){
				if(chrome.runtime.lastError){
					console.log(chrome.runtime.lastError.message);
				}
			});
		};

		if(result[today] === Services.Utility.WORKDAY){
			Services.Project.zeus().then(function(result){
				if((result.successCount + result.failCount) === result.total){
					console.info('ALL GOOD');
					console.table({result});
				}
				notify(`${i18n('success')}：${result.successCount}，${i18n('fail')}：${result.failCount}，${i18n('total')}：${result.total}`);
			}, function(e){
				notify(`${i18n('oops')} \n ${e.toString()}`)
			});
			await Services.History.pushAutoApplyHostory(today);
		}else{
			console.info('今天不用填...');
			await Services.History.cleanApplyHostories();
		}
		return;
	});
});

window.addEventListener('on-alarm-properties-change', function(event){
	chrome.alarms.clear('scheduled-apply');
	if(!event.detail.enabled){
		return;
	}
	let today = moment().transform(event.detail.scheduledAt);
	let tomorrow = today.clone().add(1, 'day');
	let now = moment();
	let when = today >= now ? today : tomorrow;
	chrome.alarms.create('scheduled-apply', {
		'when': when.valueOf(),
		'periodInMinutes': 1440
	});
	if(!event.detail.silence){
		chrome.notifications.create('test-message', {
			'type': chrome.notifications.TemplateType.BASIC,
			'title': 'IEMS Jetpack',
			'message': `我将在 ${today >= now ? '今天' : '下个工作日'} ${when.format('HH点mm分')} 时自动填写工作量，届时请保证Chrome正在运行。`,
			'iconUrl': `${imagePath}/alarm.png`
		}, function(){
			if(chrome.runtime.lastError){
				console.log(chrome.runtime.lastError.message);
			}
		});
	}
});

// Restore the alarm incase for some reason the alarm dispeared
chrome.storage.local.get(['alarm.enabled', 'alarm.scheduledAt'], function(items){
	if(!items || !items['alarm.enabled'] || !items['alarm.scheduledAt']){
		return;
	}

	let scheduledAt = moment(items['alarm.scheduledAt']);
	if(!scheduledAt.isValid()){
		return;
	}
	let time = scheduledAt.format('HH:mm:ss');
	let event = new CustomEvent('on-alarm-properties-change', {
		'detail': {
			'enabled': true,
			'scheduledAt': time,
			'silence': true
		}
	});
	chrome.alarms.get('scheduled-apply', function(alarm){
		if(!alarm){
			window.dispatchEvent(event);
		}
	});
});