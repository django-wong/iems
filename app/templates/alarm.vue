<template>
	<div id="alarm" class="has-float-footer">
		<div class="header-center">
			<Button-group size="small">
		        <i-button type="ghost" v-link="{path: '/dashboard'}">{{ 'projects' | i18n }}</i-button>
		        <i-button type="ghost" v-link="{path: '/alarm'}" class="active">{{ 'cron' | i18n }}</i-button>
		        <i-button type="ghost" v-link="{path: '/account'}">{{ 'me' | i18n }}</i-button>
		    </Button-group>
		</div>

		<Card dis-hover class="alarm-card">
            <p slot="title">
            	<span>
					<Switch :checked.sync="alarm.enabled" size="large" @on-change="onSwitch">
						<span slot="open">{{ 'on' | i18n }}</span>
						<span slot="close">{{ 'off' | i18n }}</span>
					</Switch>
					<span>{{ 'autoFill' | i18n }}</span>
            	</span>
            </p>
            <div>
				<Time-picker type="time" placeholder="Time" :disabled="!alarm.enabled" :value.sync="alarm.scheduledAt" :editable="false"></Time-picker>
            </div>
            <br/>
            <i-button type="success" long :disabled="!alarm.enabled" @click="onConfirm">{{ 'confirmed' | i18n }}</i-button>
        </Card>
	</div>
</template>

<script>
	var moment = require('moment');
	window.moment = moment;
	export default {
		ready: function(){
			var self = this;
			chrome.storage.local.get(['alarm.enabled', 'alarm.scheduledAt'], function(items){
				let scheduledAt = moment(items['alarm.scheduledAt']);
				self.alarm.enabled = items['alarm.enabled'];
				self.alarm.scheduledAt = scheduledAt.isValid() ? scheduledAt.toDate() : new Date();
			});
		},

		data: function(){
			return {
				alarm: {
					enabled: false,
					scheduledAt: null
				}
			};
		},

		methods: {
			onSwitch: function(enabled){
				chrome.storage.local.set({'alarm.enabled': enabled});
			},

			onConfirm: function(){
				let time = moment(this.alarm.scheduledAt);
				if(!this.alarm.enabled || !this.alarm.scheduledAt || !time.isValid()){
					this.$Message.warning('你这么做有意思吗？');
					return;
				}
				let scheduledAt = this.alarm.scheduledAt.toString();
				chrome.storage.local.set({'alarm.scheduledAt': scheduledAt});
				chrome.runtime.sendMessage({
					'handler': 'on-alarm-properties-change',
					'detail': {
						'enabled': this.alarm.enabled,
						'scheduledAt': time.format('HH:mm:ss')
					}
				}); 
			}
		}
	}
</script>