/*
* @Author: Django Wong
* @Date:   2017-01-09 12:17:22
* @Last Modified by:   Django Wong
* @Last Modified time: 2017-01-10 03:07:06
* @File Name: services.js
*/

'use strict';

let Auth = function(){
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
					reject(error);
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
					resolve(response.data.indexOf('注销'));
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
				});
			});
		}
	}
};

let Utility = function(){
	return {
		getViewAndEventData: function(){
			return new Promise(function(resolve, reject){
				axios.get('http://iems.shinetechchina.com.cn/MyIems/taskes/mytaskes.aspx').then(function(){
					let div = document.createElement('div');
					let data = this.extractViewAndEventDataFromHTML(response.data);
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

let Project = function(){
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
						// let div = document.createElement('div');
						// let html = table.outerHTML;
						let project = {
							HidIsOverTime: div.querySelector(`#ContentPlaceHolderMain_rtPOs_hidIsOverTime_${index}`).value.toUpperCase() === 'FALSE' ? false : true,
							PrimaryContact: div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label2_${index}`).textContent,
							ProjectCode: div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label7_${index}`).textContent,
							ProjectName: div.querySelector(`#ContentPlaceHolderMain_rtPOs_lProjectName_${index}`).textContent,
							POType: div.querySelector(`#ContentPlaceHolderMain_rtPOs_lProjectName_${index}`).parentElement.nextElementSibling.querySelector('b').nextSibling.textContent.substr(2),
							PONo: div.querySelector(`#ContentPlaceHolderMain_rtPOs_lPONo_${index}`).textContent,
							DateSigned: div.querySelector(`#ContentPlaceHolderMain_rtPOs_lPOSignDate_${index}`).textContent,
							StartDate: div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label4_${index}`).textContent,
							DueDate: div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label5_${index}`).textContent,
							POHours: parseFloat(div.querySelector(`#ContentPlaceHolderMain_rtPOs_lQuality_${index}`).textContent),
							RemainingHours: parseFloat(div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label6_${index}`).textContent),
							UnitPrice: parseFloat(div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label1_${index}`).textContent),
							Unit: div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label1_${index}`).nextSibling.textContent.substr(1),
							TotalValue: parseFloat(div.querySelector(`#ContentPlaceHolderMain_rtPOs_Label3_${index}`).textContent),
							FormData: new FormData()
						};
						let tr = div.querySelector(`#ContentPlaceHolderMain_rtPOs_tr1_${index}`);
						if(tr){
							let inputs = tr.querySelectorAll('input');
							inputs.forEach(function(input, index){
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

let History = function(){
	return {

	};
}

module.exports.install = function(Vue){
	Vue.prototype.$Auth = Auth();
	Vue.prototype.$Project = Project();
	Vue.prototype.$History = History();
	Vue.prototype.$Utility = Utility();
}
