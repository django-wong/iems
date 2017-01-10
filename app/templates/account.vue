<template>
	<div id="account" class="has-float-footer">
		<div class="header-center">
			<Button-group size="small">
		        <i-button type="ghost" v-link="{path: '/dashboard'}">项目</i-button>
		        <i-button type="ghost" v-link="{path: '/account'}" class="active">个人</i-button>
		    </Button-group>
		</div>

		<!-- <Spin size="large" fix v-if="!profile.RemainYearHoliday"></Spin> -->

		<Spin fix="true" v-if="!profile.RemainYearHoliday">
            <Icon type="load-c" size=18 class="spin-icon-load"></Icon>
            <div>Loading</div>
        </Spin>

		<Card dis-hover class="profile-card" v-if="profile.RemainYearHoliday">
            <p slot="title">
            	<img  v-bind:src="gravatar">
            	<span v-if="profile.EmployeeName">欢迎，{{ profile.EmployeeName }}</span>
            </p>
            <div>
				<p>工号：<span v-text="profile.EmployeeKey"></span></p>
				<p>岗位：<span v-text="profile.EmployeeStation"></span></p>
				<p>HR：<span v-text="profile.EmployeeHr"></span></p>
				<p>年假天数：<span v-text="profile.YearHoliday"></span>天</p>
				<p>剩余年假：<span v-text="profile.RemainYearHoliday"></span>天</p>
            </div>
        </Card>

        <div class="float-footer">
	    	<i-button type="error" long v-on:click="exit()">登出</i-button>
	    </div>
	</div>
</template>

<script>
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
				console.info(name);
			});
		},

		data: function(){
			return {
				email: '',
				gravatar: '',
				profile: {}
			}
		},

		methods: {
			exit: function(){
				chrome.storage.sync.set({'password': ''});
				window.close();
				// TODO: SIGN OUT FROM IEMS
			}
		}
	}
</script>