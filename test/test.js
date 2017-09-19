const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><p>Hello world</p>');
const expect = require('chai').expect;
global.document = dom.window.document;
global.FormData = require('../fake-form-data.js');
const Services = require('../app/scripts.babel/services.js').init({});

// const axios = require('axios');
// let origin = axios.defaults.transformRequest[0];
// axios.defaults.transformRequest.push(function(data){
// 	if(data instanceof FormData){
// 		return origin(data.toJson());
// 	}
// });

describe('APIs', function(){
	describe('Commons', function(){
		it('Host should be reachable', async function(){
			let username = await Services.Auth.checkUserName();
			expect(username).to.be.a('null');
		});
	});

	describe('Date and holiday', function(){
		it('January should have 31 days', function(){
			let days = Services.Utility.daysInMonth(1, 2017);
			expect(days).to.be.equal(31);
		});

		it('January 2017 should have 12 days off', async function(){
			let holidays = await Services.Utility.holidaysByMonth('201701');
			let days = Services.Utility.sizeof(holidays[201701]);
			expect(days).to.be.equal(12);
		});

		it('January 1st 2017 is holiday', async function(){
			let dates = await Services.Utility.holidayOnDate('20170101');
			expect(dates['20170101']).not.equal('0');
		});

		it('Sep 2017 should have 176 work hours', async function(){
			let hours = await Services.Utility.totalHoursInThisMonth('201709', 'YYYYMM');
			expect(hours).to.be.equal(176);
		});
	});

	describe('Authentication', function(){

		let requestVerificationToken;

		it('Is not logged-in', function(){
			return new Promise(async (resolve) => {
				let username = await Services.Auth.checkUserName();
				expect(username).to.be.a('null');
				resolve();
			});
		});

		it('Retired request verification token', function(){
			return new Promise(async (resolve) => {
				let token = requestVerificationToken = await Services.Auth.getRequestVerificationToken();
				expect(token).not.equal('');
				resolve();
			})
		});

		it('Is logged-in', async function(){
			return new Promise(async(resolve) => {
				let result = await Services.Auth.login({
					'email': 'huangjg@shinetechchina.com',
					'password': 'Shinetech2014',
					'token': requestVerificationToken
				});
				expect(result).to.be.equal(true);
				resolve();
			});
		});
	})
});