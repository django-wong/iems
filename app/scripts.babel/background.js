'use strict';

var qs = require('query-string');

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