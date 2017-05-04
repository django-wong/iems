<template>
	<div id="account" class="has-float-footer">
		<div class="header-center">
			<Button-group size="small">
		        <i-button type="ghost" v-link="{path: '/dashboard'}">{{ 'projects' | i18n }}</i-button>
		        <i-button type="ghost" v-link="{path: '/alarm'}">{{ 'cron' | i18n }}</i-button>
		        <i-button type="ghost" v-link="{path: '/account'}" class="active">{{ 'me' | i18n }}</i-button>
		    </Button-group>
		</div>

		<!-- <Spin size="large" fix v-if="!profile.RemainYearHoliday"></Spin> -->

		<Spin :fix="true" v-if="!profile.RemainYearHoliday">
            <Icon type="load-c" size=18 class="spin-icon-load"></Icon>
            <div>{{ 'loading' | i18n }}</div>
        </Spin>

		<Card dis-hover class="profile-card" v-if="profile.RemainYearHoliday">
            <p slot="title">
            	<img  v-bind:src="gravatar">
            	<span v-if="profile.EmployeeName">{{ 'welcome' | i18n }}，{{ profile.EmployeeName }}</span>
            </p>
            <div>
				<p>{{ 'employeeKey' | i18n }}：<span v-text="profile.EmployeeKey"></span></p>
				<p>{{ 'employeeStation' | i18n }}：<span v-text="profile.EmployeeStation"></span></p>
				<p>{{ 'hr' | i18n }}：<span v-text="profile.EmployeeHr"></span></p>
				<p>{{ 'holidays' | i18n }}：<span v-text="profile.YearHoliday"></span>{{ 'day' | i18n }}</p>
				<p>{{ 'remainHolidays' | i18n }}：<span v-text="profile.RemainYearHoliday"></span>{{ 'day' | i18n }}</p>
				<hr>
				<p>{{ 'totalHoursInThisMonth' | i18n }}: <span v-text="totalHoursInThisMonth"></span>{{ 'hour' | i18n }}</p>
            </div>
        </Card>

        <div class="float-footer">
	    	<i-button type="error" long v-on:click="exit()">{{ 'logout' | i18n }}</i-button>
	    </div>
	</div>
</template>

<script>
	var i18n = chrome.i18n.getMessage;
	export default {
		ready: function(){
			var self = this;
			this.$Auth.getUserProfile().then(function(profile){
				self.profile = profile;
			});
			chrome.storage.sync.get('email', function(items){
				self.email = items.email;
				self.gravatar = gravatar.get.url(items.email, {
					defaultIcon: 'identicon',
					size: 80
				});
			});
			this.$Auth.checkUserName().then(function(name){
				self.name = name;
			});
			this.$Utility.totalHoursInThisMonth().then((hours) => {
				self.totalHoursInThisMonth = hours;
			});
		},

		data: function(){
			return {
				email: '',
				gravatar: '',
				profile: {},
				totalHoursInThisMonth: 0
			}
		},

		methods: {
			exit: async function(){
				let logOff = await this.$Auth.logout();
				if(logOff){
					chrome.storage.sync.set({'password': ''});
					window.close();
				}
			}
		}
	}
</script>