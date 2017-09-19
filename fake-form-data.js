/*
* @Author: django-wong
* @Date:   2017-09-19 01:37:50
* @Last Modified by:   django-wong
* @Last Modified time: 2017-09-20 00:16:12
*/

var qs = require('querystring');

class FormData{

	constructor() {

	}

	set(key, value) {
		this[key] = value;
	}

	get(key) {
		return this[key];
	}

	append(key, value) {
		this[key] = value;
	}

	entries() {
		let entries = [];
		for(let key in this) {
			if(this.hasOwnProperty(key)){
				entries.push([key, this[key]]);
			}
		}
		return entries;
	}

	keys() {
		let keys = [];
		for(let key in this) {
			if(this.hasOwnProperty(key)){
				keys.push(key);
			}
		}
		return keys;
	}

	values() {
		let values = [];
		for(let key in this) {
			if(this.hasOwnProperty(key)){
				values.push(this[key]);
			}
		}
		return values;
	}

	delete(key) {
		this[key] = undefined;
		delete[key];
	}

	has(key) {
		return this.hasOwnProperty(key);
	}

	getAll(key) {
		return [this[key]];
	}

	toString() {
		return qs.stringify(this);
	}

	toJson() {
		return JSON.parse(JSON.stringify(this));
	}

}

module.exports = FormData;