/*
* @Author: Django Wong
* @Date:   2017-01-09 12:17:22
* @Last Modified by:   Django Wong
* @Last Modified time: 2017-01-11 14:57:41
* @File Name: services.js
*/

'use strict';

var moment = require('moment');

FormData.toJson = function(formData){
	var data = {};
	formData.forEach(function(value, name){
		data[name] = value;
	});
	return data;
}

var Vue;

let DateRange = {
	Today: [moment(), moment()],
	Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
	Last7Days: [moment().subtract(6, 'days'), moment()],
	Last30Days: [moment().subtract(29, 'days'), moment()],
	ThisMonth: [moment().startOf('month'), moment().endOf('month')],
	LastMonth: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
}

let Auth = function(Vue){
	var email, password;
	return {
		checkUserName: function(){
			return new Promise(function(resolve, reject){
				axios.get('http://iems.shinetechchina.com.cn/Api/Core/Navigator').then(function(response){
					resolve(response.data.Map.Title);
				}).catch(function(){
					resolve(null);
				});
			});
		},

		getEmailAndPassword: function(){
			return new Promise(function(resolve, reject){
				chrome.storage.sync.get(['email', 'password'], function(items){
					resolve(items);
				});
			});
		},

		getRequestVerificationToken: function(){
			return new Promise(function(resolve, reject){
				axios.get('http://iems.shinetechchina.com.cn/User/Login').then(function(response){
					var div = document.createElement('div');
					div.innerHTML = response.data;
					resolve(div.querySelector('[name="__RequestVerificationToken"]').value);
				}).catch(function(error){
					resolve('');
				});
			});
		},

		login: function(certificate){
			return new Promise(function(resolve, reject){
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
			return new Promise(function(resolve, reject){
				axios.post('http://iems.shinetechchina.com.cn/User/LogOff').then(function(response){
					resolve(response.data.indexOf('log in') !== -1);
				}).catch(function(){
					resolve(false);
				});;
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
				});
			});
		}
	}
};

let Utility = function(Vue){
	return {
		getViewAndEventData: function(){
			var that = this;
			return new Promise(function(resolve, reject){
				axios.get('http://iems.shinetechchina.com.cn/MyIems/taskes/mytaskes.aspx').then(function(response){
					let div = document.createElement('div');
					let data = that.extractViewAndEventDataFromHTML(response.data);
					console.info(data);
					resolve(data);
				});
			});
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
		}
	};
};

let Project = function(Vue){
	var projects = [];
	return {
		getProjects: function(){
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
						let project = {
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
								hours: 0,
								recording: false,
								title: '',
								desc: ''
							}
						};
						let tr = div.querySelector(`#ContentPlaceHolderMain_rtPOs_tr1_${index}`);
						if(tr){
							project.FormData = new FormData();
							let inputs = tr.querySelectorAll('input');
							inputs.forEach(function(input, index){
								project.FormData.append(input.name, input.value);
							});

							let next = tr.parentElement.parentElement.parentElement.nextElementSibling;
							let hiddenInputs = next.querySelectorAll('input');
							hiddenInputs.forEach(function(input, index){
								project.FormData.append(input.name, input.value);
							});
						}
						items.push(project);
					});
					projects = items;
					resolve(items);
				});
			});
		},

		obtainProject: function(project_code){
			for (var i = 0; i < projects.length; i++) {
				if(projects[i].ProjectCode === project_code){
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
			let formData = await this._prepareFormData(project, hours, title, desc);
			let data = FormData.toJson(formData);
			return new Promise(function(resolve, reject){
				axios.post('http://iems.shinetechchina.com.cn/MyIems/taskes/mytaskes.aspx', formData).then(function(response){
					project.data.recording = false;
					if(response.data.indexOf('添加成功') !== -1){
						project.RemainingHours -= hours;
						project.data.hours = 0;
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
			return new Promise(function(resolve, reject){
				chrome.storage.sync.get('stated-project', function(items){
					resolve(items);
				});
			});
		},

		star: async function(project_code){
			this.getStars().then(function(){

			});
		},

		unstar: function(project_code){

		}
	};
}

let History = function(Vue){
	return {
		/**
		 * Query workload historis
		 * @param  {string} contact 
		 * @param  {string} name    
		 * @param  {string} start   2016-01-10
		 * @param  {string} due     2016-01-10
		 * @param  {string} type    not used
		 * @return {promise}
		 */
		query: function(contact, name, start, due, type){
			let formData = new FormData();
			formData.set('ctl00$ContentPlaceHolderMain$txtPrimaryContact', contact);
			formData.set('ctl00$ContentPlaceHolderMain$txtProjectId', name);
			formData.set('ctl00$ContentPlaceHolderMain$txtStartDate', start);
			formData.set('ctl00$ContentPlaceHolderMain$txtDueDate', due);
			return new Promise(function(resolve, reject){
				axios.post('http://iems.shinetechchina.com.cn/MyIems/taskes/mytaskeslist.aspx', formData).then(function(response){
					let html = response.data;
					let div = document.createElement('div');
					div.innerHTML = html;
					let table = div.querySelector('#ContentPlaceHolderMain_grvEmployeeWorkload');
					let trs = table.querySelectorAll('tr[align=left]');
					var items = [];
					trs.forEach(function(tr, index){
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
			return this.query(contact, name, today, today);
		}
	};
}

module.exports.install = function(v){
	Vue = v;
	Vue.prototype.$Auth = Vue.Auth = Auth(Vue);
	Vue.prototype.$Project = Vue.Project = Project(Vue);
	Vue.prototype.$History = Vue.History = History(Vue);
	Vue.prototype.$Utility = Vue.Utility = Utility(Vue);
}