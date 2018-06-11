/*
* @Author: Django Wong
* @Date:   2017-01-09 12:17:22
* @Last Modified by:   django-wong
* @Last Modified time: 2018-06-11 18:22:28
* @File Name: services.js
*/

'use strict';

var moment = require('moment');
var axios = require('axios');
var sha1 = require('sha1');

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
        /**
         * Get the user name
         * @return {promise<string>}
         */
        checkUserName: function(){
            return new Promise(function(resolve){
                axios.get('http://iems.shinetechchina.com.cn/Api/Core/Navigator').then(function(response){
                    resolve(response.data.Map.Title);
                }).catch(function(){
                    resolve(null);
                });
            });
        },

        /**
         * Get the user email and password from sync storage
         * @return {promise<object>} [description]
         */
        getEmailAndPassword: function(){
            return new Promise(function(resolve){
                chrome.storage.sync.get(['email', 'password'], function(items){
                    resolve(items);
                });
            });
        },

        /**
         * Get request verification token
         * @return {promise<string>}
         */
        getRequestVerificationToken: function(){
            return new Promise(function(resolve){
                axios.get('http://iems.shinetechchina.com.cn/User/Login?ReturnUrl=%2F').then(function(response){
                    var div = document.createElement('div');
                    div.innerHTML = response.data;
                    resolve(div.querySelector('[name="__RequestVerificationToken"]').value);
                }).catch(function(){
                    resolve('');
                });
            });
        },

        /**
         * Login to IEMS
         * @param  {object} certificate 
         * @return {primise<boolean>}             
         */
        login: function(certificate){
            return new Promise(function(resolve){
                var formData = new FormData();
                formData.append('__RequestVerificationToken', certificate.token);
                formData.append('Email', certificate.email);
                formData.append('Password', certificate.password);
                formData.append('RememberMe', 'true');
                axios.post('http://iems.shinetechchina.com.cn/User/Login', formData).then(function(response){
                    resolve(response.data.indexOf('注销') !== -1);
                }).catch(function(error){
                    if(error.response && error.response.data){
                        resolve(error.response.data.indexOf('Log off') !== -1)
                    }
                    resolve(false);
                });
            });
        },

        /**
         * Logout from IEMS
         * @return {promise<boolean>} 
         */
        logout: function(){
            chrome.alarms.clearAll(console.log);
            return new Promise(function(resolve){
                axios.post('http://iems.shinetechchina.com.cn/User/LogOff').then(function(){
                    resolve(true);
                }).catch(function(){
                    resolve(false);
                });
            });
        },

        /**
         * Get user profile
         * @return {promise<object>} 
         */
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

        /**
         * The size of an object's own properties or the length of an array
         * @param  {mixed} object , object or array
         * @return {number}        
         */
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

        /**
         * Get view and event data, this data will be use to communicate with IEMS server
         * @return {promise<object>}
         */
        getViewAndEventData: function(){
            var that = this;
            return new Promise(function(resolve, reject){
                axios.get('http://iems.shinetechchina.com.cn/MyIems/taskes/mytaskes.aspx').then(function(response){
                    let data = that.extractViewAndEventDataFromHTML(response.data);
                    resolve(data);
                }, function(){
                    reject();
                });
            });
        },

        /**
         * How many days in this month
         * @param  {string} month mm
         * @param  {string} year  yyyy
         * @return {number}       
         */
        daysInMonth(month, year) {
            return new Date(year, month, 0).getDate();
        },

        /**
         * Extract view and event data from the HTML template
         * @param  {string} html 
         * @return {object}      
         */
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

        /**
         * The holidays collections in the month
         * @param  {string} month yyyymm
         * @return {promise<object>}       
         */
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

        /**
         * The holidays in the months
         * @param  {array<string>} months ['yyyymm']
         * @return {promise<object>}
         */
        holidaysByMonths: function(months){
            return this.holidaysByMonth(months.join(','));
        },

        /**
         * Get holidays by given dates
         * @param  {array<string>} dates ['yyyymmdd']
         * @return {promise<object>}       [description]
         */
        holidaysByDates: function(dates){
            return this.holidayOnDate(dates.join(','));
        },

        /**
         * The holiday data at this day
         * @param  {string} date yyyymmdd
         * @return {promise<object>}
         */
        holidayOnDate: function(date){
            return new Promise(function(resolve, reject){
                axios.get('http://tool.bitefu.net/jiari/', {
                    params: {
                        d: `${date},20170101`
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
        /**
         * Get all projects
         * @return {promise<array>} [description]
         */
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
                            ProjectCode: ProjectCodeEle ? ProjectCodeEle.textContent : '',
                            ProjectName: ProjectNameEle ? ProjectNameEle.textContent : null,
                            POType: ProjectNameEle ? ProjectNameEle.parentElement.nextElementSibling.textContent.split(' ').pop() : null,
                            PONo: PONoEle ? PONoEle.textContent : '',
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
                        project.$SHA1 = sha1(project.ProjectCode.trim()+'&'+project.PONo.trim());

                        let preference = preferences[project.$SHA1] || preferences[project.ProjectCode];
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

        /**
         * Auto apply the projects according to the user setting
         * @return {promise<mixed>} object on resolved or an instance of Error on rejected
         */
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

        /**
         * Get project data by project code
         * @param  {string} ProjectCode 
         * @return {object}             
         */
        obtainProject: function($SHA1){
            for (var i = 0; i < projects.length; i++) {
                if(projects[i].$SHA1 === $SHA1){
                    return projects[i];
                }
            }
        },

        /**
         * Private method to prepare form data for auto-apply work load
         * @param  {object} project 
         * @param  {number} hours   
         * @param  {string} title   
         * @param  {string} desc    
         * @return {formData}         
         */
        _prepareFormData: function(project, hours, title, desc){
            return new Promise(async (resolve) => {
                let data = await Vue.Utility.getViewAndEventData();
                let formData = project.FormData;
                for(var i in data){
                    if(data.hasOwnProperty(i)){
                        formData.delete(i);
                        formData.append(i, data[i]);
                    }
                }

                formData.delete(`ctl00$ContentPlaceHolderMain$rtPOs$ctl${project.$num}$txtTask1`);
                formData.append(`ctl00$ContentPlaceHolderMain$rtPOs$ctl${project.$num}$txtTask1`, title);
                formData.delete(`ctl00$ContentPlaceHolderMain$rtPOs$ctl${project.$num}$txtHours1`);
                formData.append(`ctl00$ContentPlaceHolderMain$rtPOs$ctl${project.$num}$txtHours1`, hours);
                formData.delete(`ctl00$ContentPlaceHolderMain$rtPOs$ctl${project.$num}$txtDescription1`);
                formData.append(`ctl00$ContentPlaceHolderMain$rtPOs$ctl${project.$num}$txtDescription1`, desc);
                resolve(formData);
            });
        },

        /**
         * Record work load
         * @param  {object} project 
         * @param  {number} hours   
         * @param  {string} title   
         * @param  {string} desc    
         * @return {promise<boolean>}         
         */
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

        /**
         * Get stared projects
         * @return {promise<object>} 
         */
        getStars: function(){
            return new Promise(function(resolve){
                chrome.storage.sync.get('stated-project', function(items){
                    resolve(items);
                });
            });
        },

        /**
         * Star a project
         * @param  {string} project_code
         * @return {promise<boolean>}              
         */
        star: function(){
            // TODO: Start a project
        },

        /**
         * Unstar a project
         * @param  {string} project_code 
         * @return {promise<boolean>}              
         */
        unstar: function(){
            // TODO: Unstart the project
        },

        /**
         * Get the project preference
         * @return {promise<object>} 
         */
        getProjectPerferences: function(){
            return new Promise(function(resolve){
                chrome.storage.sync.get('preference.projects', function(items){
                    resolve(items['preference.projects'] || {});
                });
            });
        },

        /**
         * Set the project preference
         * @param  {string} projectCode 
         * @param  {number} hours       
         * @param  {string} title       
         * @param  {string} desc        
         * @param  {boolean} excluded    
         * @return {void}             
         */
        setPerference: async function($SHA1, hours, title, desc, excluded){
            var preferences = await this.getProjectPerferences();
            var preference = await this.getPerference($SHA1);
            preference.hours = hours;
            preference.title = title;
            preference.desc = desc;
            preference.excluded = excluded;
            preferences[$SHA1] = preference;
            chrome.storage.sync.set({
                'preference.projects': preferences
            });
        },

        /**
         * Get the project preferences
         * @param  {string} $SHA1 
         * @return {object}             
         */
        getPerference: async function($SHA1){
            var preferences = await this.getProjectPerferences();
            if(preferences.hasOwnProperty($SHA1)){
                return preferences[$SHA1];
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
            formData.append('ctl00$ContentPlaceHolderMain$txtPrimaryContact', contact);
            formData.append('ctl00$ContentPlaceHolderMain$txtProjectId', name);
            formData.append('ctl00$ContentPlaceHolderMain$txtStartDate', start);
            formData.append('ctl00$ContentPlaceHolderMain$txtDueDate', due);
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
            let due = DateRange.ThisMonth[1].format('YYYY-MM-DD');
            return this.query(contact, name, start, due);
        },

        queryToday: function(contact, name){
            let today = moment().format('YYYY-MM-DD');
            return this.query(contact, name, today, today);
        },

        queryLast7Days: function(contact, name){
            let start = DateRange.Last7Days[0].format('YYYY-MM-DD');
            let due = DateRange.Last7Days[1].format('YYYY-MM-DD');
            return this.query(contact, name, start, due);
        },

        /**
         * Clean the apply histories
         * @see  this.autoApplyHistories
         * @return {promise<boolean>}
         */
        cleanApplyHostories: function(){
            return new Promise((resolve) => {
                chrome.storage.sync.set({
                    'history.applies': {}
                }, () => {
                    resolve(true)
                });
            });
        },

        /**
         * Get all appliy hostories, you shouldn't rely on this kind methods, as the histories will be clean at next holiday day 
         * @return {promise<object>}
         */
        autoApplyHistories: function(){
            return new Promise((resolve) => {
                chrome.storage.sync.get('history.applies', (items) => {
                    resolve(items['history.applies'] || {});
                });
            });
        },

        /**
         * Determin is the given date in the apply histories
         * @see  this.autoApplyHistories
         * @param  {string} date yyyymmdd
         * @return {primise<boolean>}
         */
        inAutoApplyHistories: function(date){
            return new Promise(async (resolve) => {
                let histories = await this.autoApplyHistories();
                resolve(histories[date] !== undefined);
            });
        },

        /**
         * Push auto-apply history to sync storage
         * @see  this.autoApplyHistories
         * @param  {string} date  yyyymmdd
         * @return {promise<boolean>}       
         */
        pushAutoApplyHostory: function(date){
            return new Promise(async (resolve) => {
                let histories = this.autoApplyHistories();
                histories[date] = true;
                chrome.storage.sync.set({
                    'history.applies': histories
                }, () => {
                    resolve(true);
                });
            })
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
