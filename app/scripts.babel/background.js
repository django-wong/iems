'use strict';

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

window.addEventListener('scheduled-apply', function(event){
	let alarm = event.detail;
	chrome.storage.sync.get(['alarm.enabled', 'alarm.scheduledAt'], async function(items){
		// Preliminary checks
		let enabled = items['alarm.enabled'];
		let scheduledAt = moment(items['alarm.scheduledAt']);
		if(!enabled || !scheduledAt.isValid()){
			return;
		}
		// Prepare next alarm
		let time = scheduledAt.format('HH:mm:ss');
		let next = moment().add(1, 'day').transform(time);
		// let next = moment().add(15, 's'); //Debug only

		let today = moment().format('YYYYMMDD');
		let result = await Services.Utility.holidayOnDate(today);

		var notify = function(message){
			chrome.notifications.create('test-message', {
				type: chrome.notifications.TemplateType.BASIC,
				title: 'IEMS Jetpack',
				message: `${message} \n`,
				iconUrl: `${imagePath}/icon-128.png`
			}, function(id){
				if(chrome.runtime.lastError){
					console.log(chrome.runtime.lastError.message);
				}
			});
		};

		if(result[today] === Services.Utility.WORKDAY){
			Services.Project.zeus().then(function(result){
				if((result.successCount + result.failCount) === result.total){
					console.info('ALL GOOD');
				}
				notify(`成功：${result.successCount}，失败：${result.failCount}，总计：${result.total}`);
			}, function(){
				notify('好像哪里出错了～ ')
			});
		}

		chrome.alarms.create('scheduled-apply', {
			'when': next.valueOf()
		});
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
		'when': when.valueOf()
	});
	if(!event.detail.silence){
		chrome.notifications.create('test-message', {
			'type': chrome.notifications.TemplateType.BASIC,
			'title': 'IEMS Jetpack',
			'message': `我将在 ${today >= now ? '今天' : '下个工作日'} ${when.format('HH点mm分')} 时自动填写工作量，届时请保证Chrome正在运行。`,
			'iconUrl': `${imagePath}/alarm.png`
		}, function(id){
			if(chrome.runtime.lastError){
				console.log(chrome.runtime.lastError.message);
			}
		});
	}
});

chrome.storage.sync.get(['alarm.enabled', 'alarm.scheduledAt'], function(items){
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