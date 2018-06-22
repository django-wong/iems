'use strict';

var i18n = window.i18n = chrome.i18n.getMessage;
var moment = window.moment = require('moment');
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
    console.info(`on alarm: ${alarm.name}`, new Date());
    let event = new CustomEvent(alarm.name, {
        detail: alarm
    });
    window.dispatchEvent(event);
});


window.addEventListener('scheduled-apply', function(){

    chrome.storage.local.get(['alarm.enabled', 'alarm.scheduledAt'], async function(items) {
        // Preliminary checks
        let enabled = items['alarm.enabled'];
        if(!enabled){
            console.info('Alarm been cancled');
            return;
        }
        
        /**
         * Show a notify quickly
         * @param  {string} message 
         * @return {void}
         */
        var notify = function(message){
            const id = 'fbb01d5f-29ed-42e1-b91c-8a378925e4c1';
            chrome.notifications.clear(id, () => {
                chrome.notifications.create(id, {
                    type: chrome.notifications.TemplateType.BASIC,
                    title: 'IEMS Jetpack',
                    message: `${message} \n`,
                    iconUrl: `${imagePath}/icon-128.png`
                }, function(){
                    if(chrome.runtime.lastError){
                        console.log(chrome.runtime.lastError.message);
                    }
                });
            });
        };

        let today, result, inHistories;

        try{
            today = moment().format('YYYYMMDD');
            result = await Services.Utility.holidayOnDate(today);
            inHistories = await Services.History.inAutoApplyHistories(today);
        }catch(e){
            notify(`${i18n('oops')} \n ${e.toString()}`)
            return;
        }
        
        if(inHistories){
            console.info('Already applied today');
            return;
        }


        if(result[today].toString() === Services.Utility.WORKDAY){
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

    /**
     * @see http://momentjs.com/docs/#/plugins/transform/
     */
    let today = moment().transform(`${event.detail.scheduledAt}.000`);
    let tomorrow = today.clone().add(1, 'day');

    console.info(event.detail.scheduledAt);
    console.info(today.format('今天：YYYY/MM/DD HH:mm:ss'));
    console.info(tomorrow.format('明天：YYYY/MM/DD HH:mm:ss'));

    let now = moment();
    let when = today >= now ? today : tomorrow;

    chrome.alarms.create('scheduled-apply', {
        'when': when.valueOf(),
        'periodInMinutes': 1440
    });

    const message = `我将在 ${today >= now ? '今天' : '下个工作日'} ${when.format('MM月DD日 HH点mm分')} 时自动填写工作量，届时请保证Chrome正在运行。`;

    if(!event.detail.silence){
        const id = '953fbb38-af7c-4643-be5b-730e49f52a18';
        chrome.notifications.clear(id, () => {
            chrome.notifications.create(id, {
                'type': chrome.notifications.TemplateType.BASIC,
                'title': 'IEMS Jetpack',
                'message': message,
                'iconUrl': `${imagePath}/alarm.png`
            }, function(){
                if(chrome.runtime.lastError){
                    console.log(chrome.runtime.lastError.message);
                }
            });
        })
    }else{
        console.info(message);
    }
});


let hello = async function() {
    let today = moment().format('YYYYMMDD');
    let result = await Services.Utility.holidayOnDate(today);
    if(result[today].toString() !== Services.Utility.WORKDAY){
        console.info('Hi, 周末愉快');
        await Services.History.cleanApplyHostories();
    }else{
        console.info('Hi, 工作愉快');
    }
};


hello();


chrome.alarms.create('self-check', {
    'when': (new Date()).valueOf(),
    'periodInMinutes': 5
});