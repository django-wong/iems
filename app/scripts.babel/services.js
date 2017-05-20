/*
* @Author: Django Wong
* @Date:   2017-01-09 12:17:22
* @Last Modified by:   Django Wong
* @Last Modified time: 2017-05-20 22:05:26
* @File Name: services.js
*/

'use strict';

var moment = require('moment');
var axios = require('axios');

FormData.toJson = function(formData){
	var data = {};
	formData.forEach(function(value, name){
		data[name] = value;
	});
	return data;
};

var Vue;

let DateRange = {
	Today: [moment(), moment()],
	Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
	Last7Days: [moment().subtract(6, 'days'), moment()],
	Last30Days: [moment().subtract(29, 'days'), moment()],
	ThisMonth: [moment().startOf('month'), moment().endOf('month')],
	LastMonth: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
};

let Auth = function(){
	return {
		checkUserName: function(){
			return new Promise(function(resolve){
				axios.get('http://iems.shinetechchina.com.cn/Api/Core/Navigator').then(function(response){
					resolve(response.data.Map.Title);
				}).catch(function(){
					resolve(null);
				});
			});
		},

		getEmailAndPassword: function(){
			return new Promise(function(resolve){
				chrome.storage.sync.get(['email', 'password'], function(items){
					resolve(items);
				});
			});
		},

		getRequestVerificationToken: function(){
			return new Promise(function(resolve){
				axios.get('http://iems.shinetechchina.com.cn/User/Login').then(function(response){
					var div = document.createElement('div');
					div.innerHTML = response.data;
					resolve(div.querySelector('[name="__RequestVerificationToken"]').value);
				}).catch(function(){
					resolve('');
				});
			});
		},

		login: function(certificate){
			return new Promise(function(resolve){
				axios.post('http://iems.shinetechchina.com.cn/User/Login', {
					__RequestVerificationToken: certificate.token,
					Email: certificate.email,
					Password: certificate.password,
					RememberMe: 'true'
				}, {
					transformRequest: [function(data){
						var formDate = new FormData();
						for(var i in data){
							if(data.hasOwnProperty(i)){
								formDate.set(i, data[i]);
							}
						}
						return formDate;
					}]
				}).then(function(response){
					resolve(response.data.indexOf('注销') !== -1);
				}).catch(function(error){
					if(error.response && error.response.data){
						resolve(error.response.data.indexOf('Log off') !== -1)
					}
					resolve(false);
				});
			});
		},

		logout: function(){
			chrome.alarms.clearAll(console.log);
			return new Promise(function(resolve){
				axios.post('http://iems.shinetechchina.com.cn/User/LogOff').then(function(response){
					resolve(response.data.indexOf('log in') !== -1);
				}).catch(function(){
					resolve(false);
				});
			});
		},

		getUserProfile: function(){
			return new Promise(function(resolve, reject){
				axios.get('http://iems.shinetechchina.com.cn/MyIems/default.aspx').then(function(response){
					let div = document.createElement('div');
					div.innerHTML = response.data;
					let profile = {};
					profile.EmployeeName = div.querySelector('#ContentPlaceHolderMain_lblEmployeeName').textContent;
					profile.EmployeeKey = parseInt(div.querySelector('#ContentPlaceHolderMain_lblEmployeeKey').textContent);
					profile.EmployeeStation = div.querySelector('#ContentPlaceHolderMain_lblEmployeeStation').textContent;
					profile.EmployeeHr = div.querySelector('#ContentPlaceHolderMain_lblHr').textContent;
					profile.YearHoliday = parseInt(div.querySelector('#ContentPlaceHolderMain_lblYearHoliday').textContent);
					profile.RemainYearHoliday = parseInt(div.querySelector('#ContentPlaceHolderMain_lblRemainYearHoliday').textContent);
					resolve(profile);
				}, function(error){
					reject(error);
				});
			});
		}
	}
};

let Utility = function(){
	return {
		HOLIDAY: '2',
		WEEKEND: '1',
		WORKDAY: '0',

		sizeof: function(object){
			if(!(typeof object === 'object')){
				return 0;
			}
			if(Array.isArray(object)){
				return object.length;
			}
			var size = 0;
			for(var i in object){
				size += object.hasOwnProperty(i) ? 1 : 0;
			}
			return size;
		},

		getViewAndEventData: function(){
			var that = this;
			return new Promise(function(resolve){
				axios.get('http://iems.shinetechchina.com.cn/MyIems/taskes/mytaskes.aspx').then(function(response){
					let data = that.extractViewAndEventDataFromHTML(response.data);
					resolve(data);
				});
			});
		},

		daysInMonth(month, year) {
			return new Date(year, month, 0).getDate();
		},

		extractViewAndEventDataFromHTML: function(html){
			let div = document.createElement('div');
			div.innerHTML = html;
			let data = {
				'__EVENTTARGET': div.querySelector('[name=__EVENTTARGET]').value,
				'__EVENTARGUMENT': div.querySelector('[name=__EVENTARGUMENT]').value,
				'__VIEWSTATE': div.querySelector('[name=__VIEWSTATE]').value,
				'__VIEWSTATEGENERATOR': div.querySelector('[name=__VIEWSTATEGENERATOR]').value,
				'__EVENTVALIDATION': div.querySelector('[name=__EVENTVALIDATION]').value
			};
			return data;
		},

		holidaysByMonth: function(month){
			return new Promise(function(resolve, reject){
				axios.get('http://www.easybots.cn/api/holiday.php', {
					params: {
						m: month
					}
				}).then(function(response){
					resolve(response.data);
				}, function(error){
					reject(error);
				})
			});
		},

		holidaysByMonths: function(months){
			return new Promise(function(resolve, reject){
				axios.get('http://www.easybots.cn/api/holiday.php', {
					params: {
						m: months.join(',')
					}
				}).then(function(response){
					resolve(response.data);
				}, function(error){
					reject(error);
				})
			});
		},

		holidaysByDates: function(dates){
			return new Promise(function(resolve, reject){
				axios.get('http://www.easybots.cn/api/holiday.php', {
					params: {
						d: dates.join(',')
					}
				}).then(function(response){
					resolve(response.data);
				}, function(error){
					reject(error);
				})
			});
		},

		holidayOnDate: function(date){
			return new Promise(function(resolve, reject){
				axios.get('http://www.easybots.cn/api/holiday.php', {
					params: {
						d: date
					}
				}).then(function(response){
					resolve(response.data);
				}, function(error){
					reject(error);
				})
			});
		},

		/**
		 * Get total work hours in a month
		 * @param  {mixed} month see: monment()
		 * @return {[type]}       [description]
		 */
		totalHoursInThisMonth: async function(month, format){
			return new Promise(async (resolve) => {
				var date = moment(month, format);
				var days = this.daysInMonth(date.month()+1, date.year());
				var m = date.format('YYYYMM');
				var holidays = await this.holidaysByMonth(date.format('YYYYMM'));
				resolve((days - this.sizeof(holidays[m]))*8);
			});
		}
	};
};

let Project = function(Vue){
	var projects = [];
	return {
		getProjects: async function(){
			var preferences = await this.getProjectPerferences();
			return new Promise(function(resolve, reject){
				axios.get('http://iems.shinetechchina.com.cn/MyIems/taskes/mytaskes.aspx').then(function(response){
					let div = document.createElement('div');
					div.innerHTML = response.data;
					let tables = div.querySelectorAll('[cellpadding="3"]');
					var items = [];
					tables.forEach(function(table, index){
						let HidIsOverTimeEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_hidIsOverTime_${index}`);
						let PrimaryContactEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label2_${index}`);
						let ProjectCodeEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label7_${index}`);
						let ProjectNameEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_lProjectName_${index}`);
						let POTypeEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_lProjectName_${index}`);
						let PONoEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_lPONo_${index}`);
						let DateSignedEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_lPOSignDate_${index}`);
						let StartDateEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label4_${index}`);
						let DueDateEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label5_${index}`);
						let POHoursEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_lQuality_${index}`);
						let RemainingHoursEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label6_${index}`);
						let UnitPriceEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label1_${index}`);
						let UnitEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label1_${index}`);
						let TotalValueEle = div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label3_${index}`);
						
						POTypeEle = POTypeEle || null;
						UnitEle = UnitEle || null;

						var project = {
							HidIsOverTime: HidIsOverTimeEle ? (HidIsOverTimeEle.value.toUpperCase() === 'FALSE' ? false : true) : false,
							PrimaryContact: PrimaryContactEle ? PrimaryContactEle.textContent : null,
							ProjectCode: ProjectCodeEle ? ProjectCodeEle.textContent : null,
							ProjectName: ProjectNameEle ? ProjectNameEle.textContent : null,
							POType: ProjectNameEle ? ProjectNameEle.parentElement.nextElementSibling.querySelector('b').nextSibling.textContent.substr(2) : null,
							PONo: PONoEle ? PONoEle.textContent : null,
							DateSigned: DateSignedEle ? DateSignedEle.textContent : null,
							StartDate: StartDateEle ? StartDateEle.textContent : null,
							DueDate: DueDateEle ? DueDateEle.textContent : null,
							POHours: POHoursEle ? parseFloat(POHoursEle.textContent) : 0,
							RemainingHours: RemainingHoursEle ? parseFloat(RemainingHoursEle.textContent) : 0,
							UnitPrice: UnitPriceEle ? parseFloat(UnitPriceEle.textContent) : null,
							Unit: UnitPriceEle ? UnitPriceEle.nextSibling.textContent.substr(1) : '',
							TotalValue: TotalValueEle ? parseFloat(TotalValueEle.textContent) : 0,
							FormData: new FormData(),
							// 额外的属性
							$num: index < 10 ? `0${index}` : index,
							data: {
								hours: 8,
								recording: false,
								title: '',
								desc: '',
								excluded: false
							}
						};
						let preference = preferences[project.ProjectCode];
						if(preference && preference.hasOwnProperty('hours')){
							project.data.hours = preference.hours;
							project.data.title = preference.title;
							project.data.desc = preference.desc;
							project.data.excluded = preference.excluded;
						}
						let tr = div.querySelector(`#ContentPlaceHolderMain_rtPOs_tr1_${index}`);
						if(tr){
							project.FormData = new FormData();
							let inputs = tr.querySelectorAll('input');
							inputs.forEach(function(input){
								project.FormData.append(input.name, input.value);
							});

							let next = tr.parentElement.parentElement.parentElement.nextElementSibling;
							let hiddenInputs = next.querySelectorAll('input');
							hiddenInputs.forEach(function(input){
								project.FormData.append(input.name, input.value);
							});
						}
						items.push(project);
					});
					projects = items;
					resolve(items);
				}, function(error){
					reject(error);
				});
			});
		},

		zeus: function(){
			var self = this;
			return new Promise(async function(resolve, reject){
				var name = await Vue.Auth.checkUserName();
				if(!name){
					var certificate = await Vue.Auth.getEmailAndPassword();
					certificate.token = await Vue.Auth.getRequestVerificationToken();
					if(!certificate.email || !certificate.password || !certificate.token){
						reject(new Error('Bad certificate.'));
						return;
					}
					if(!(await Vue.Auth.login(certificate))){
						reject(new Error('Login failed'));
						return;
					}
				}
				self.getProjects().then(function(projects){
					var total = projects.length;
					var successCount = 0;
					var failCount = 0;
					if(total === 0){
						resolve({
							successCount: 0,
							failCount: 0,
							total: 0
						});
					}
					var callback = function(res){
						if(res){
							successCount++;
						}else{
							failCount++;
						}
						if((successCount + failCount) === total){
							resolve({
								successCount: successCount,
								failCount: failCount,
								total: total
							});
						}
					};
					projects.forEach(function(project){
						let hours = project.data.hours;
						let title = project.data.title;
						let desc = project.data.desc;
						let excluded = project.data.excluded;
						if(excluded){
							total--;
							successCount--;
							callback(true);
							return;
						}
						self.recordWorkload(project, hours, title, desc).then(callback);
					});
				}, function(error){
					reject(error);
				});
			});
		},

		obtainProject: function(ProjectCode){
			for (var i = 0; i < projects.length; i++) {
				if(projects[i].ProjectCode === ProjectCode){
					return projects[i];
				}
			}
		},

		_prepareFormData: async function(project, hours, title, desc){
			let data = await Vue.Utility.getViewAndEventData();
			let formData = project.FormData;
			for(var i in data){
				if(data.hasOwnProperty(i)){
					formData.set(i, data[i]);
				}
			}
			formData.forEach(function(value, name, data){
				switch(name) {
					case `ctl00$ContentPlaceHolderMain$rtPOs$ctl${project.$num}$txtTask1`:
						data.set(name, title);
						break;
					case `ctl00$ContentPlaceHolderMain$rtPOs$ctl${project.$num}$txtHours1`:
						data.set(name, hours);
						break;
					case `ctl00$ContentPlaceHolderMain$rtPOs$ctl${project.$num}$txtDescription1`:
						data.set(name, desc);
						break;
				}
			});
			return formData;
		},

		recordWorkload: async function(project, hours, title, desc){
			project.data.recording = true;
			let now = moment();
			desc = desc || ''; desc = desc.replace(/{time}/g, now.format('HH:mm:ss'));
			let formData = await this._prepareFormData(project, hours, title, desc);
			return new Promise(function(resolve){
				axios.post('http://iems.shinetechchina.com.cn/MyIems/taskes/mytaskes.aspx', formData).then(function(response){
					project.data.recording = false;
					if(response.data.indexOf('添加成功') !== -1){
						project.RemainingHours -= hours;
						resolve(true);
					}
					resolve(false);
				}).catch(function(){
					project.data.recording = false;
					resolve(false);
				});
			});
		},

		getStars: function(){
			return new Promise(function(resolve){
				chrome.storage.sync.get('stated-project', function(items){
					resolve(items);
				});
			});
		},

		star: function(project_code){
			// TODO: Start a project
			console.info(project_code);
		},

		unstar: function(project_code){
			// TODO: Unstart the project
			console.info(project_code);
		},

		getProjectPerferences: function(){
			return new Promise(function(resolve){
				chrome.storage.sync.get('preference.projects', function(items){
					resolve(items['preference.projects'] || {});
				});
			});
		},

		setPerference: async function(projectCode, hours, title, desc, excluded){
			var preferences = await this.getProjectPerferences();
			var preference = await this.getPerference(projectCode);
			preference.hours = hours;
			preference.title = title;
			preference.desc = desc;
			preference.excluded = excluded;
			preferences[projectCode] = preference;
			chrome.storage.sync.set({
				'preference.projects': preferences
			});
		},

		getPerference: async function(projectCode){
			var preferences = await this.getProjectPerferences();
			if(preferences.hasOwnProperty(projectCode)){
				return preferences[projectCode];
			}
			return {};
		}
	};
};

let History = function(){
	return {
		/**
		 * Query workload historis
		 * @param  {string} contact 
		 * @param  {string} name    
		 * @param  {string} start   2016-01-10
		 * @param  {string} due     2016-01-10
		 * @return {promise}
		 */
		query: function(contact, name, start, due){
			let formData = new FormData();
			formData.set('ctl00$ContentPlaceHolderMain$txtPrimaryContact', contact);
			formData.set('ctl00$ContentPlaceHolderMain$txtProjectId', name);
			formData.set('ctl00$ContentPlaceHolderMain$txtStartDate', start);
			formData.set('ctl00$ContentPlaceHolderMain$txtDueDate', due);
			return new Promise(function(resolve){
				axios.post('http://iems.shinetechchina.com.cn/MyIems/taskes/mytaskeslist.aspx', formData).then(function(response){
					let html = response.data;
					let div = document.createElement('div');
					div.innerHTML = html;
					let table = div.querySelector('#ContentPlaceHolderMain_grvEmployeeWorkload');
					let trs = table.querySelectorAll('tr[align=left]');
					var items = [];
					trs.forEach(function(tr){
						var tds = tr.querySelectorAll('td');
						let item = {
							name: tds[0].textContent.trim(),
							primary_contact: tds[1].textContent.trim(),
							project_name: tds[2].textContent.trim(),
							po_no: tds[3].textContent.trim(),
							work_date: tds[4].textContent.trim(),
							title: tds[5].textContent.trim(),
							work_hours: parseFloat(tds[6].textContent.trim()),
							description: tds[7].textContent.trim(),
							type: tds[8].textContent.trim()
						};
						items.push(item);
						items.total = items.total ? items.total + item.work_hours : item.work_hours;
					});
					resolve(items);
				}).catch(function(){
					resolve([]);
				});
			});
		},

		queryThisMonth: function(contact, name){
			let start = DateRange.ThisMonth[0].format('YYYY-MM-DD');
			let due = DateRange.ThisMonth[0].format('YYYY-MM-DD');
			return this.query(contact, name, start, due);
		},

		queryToday: function(contact, name){
			let today = moment().format('YYYY-MM-DD');
			return this.query(contact, name, today, today);
		},

		queryLast7Days: function(contact, name){
			let start = DateRange.Last7Days[0].format('YYYY-MM-DD');
			let due = DateRange.Last7Days[0].format('YYYY-MM-DD');
			return this.query(contact, name, start, due);
		}
	};
};

module.exports.install = function(v){
	Vue = v;
	Vue.prototype.$Auth = Vue.Auth = Auth(Vue);
	Vue.prototype.$Project = Vue.Project = Project(Vue);
	Vue.prototype.$History = Vue.History = History(Vue);
	Vue.prototype.$Utility = Vue.Utility = Utility(Vue);
};

module.exports.init = function(object){
	object = typeof object === 'object' ? object : {};
	object.Auth = Auth(object);
	object.Project = Project(object);
	object.History = History(object);
	object.Utility = Utility(object);
	return object;
};