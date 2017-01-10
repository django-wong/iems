<template>
	<div id="login">
		<div style="text-align:center">
			<p class="main-title">
				<img src="../images/logo.png">
			</p>
		</div>
		<div>
			<i-input size="large" placeholder="用户名" :value.sync="formInline.email" type="email" icon="ios-email-outline"></i-input>
			<i-input size="large" placeholder="密码" :value.sync="formInline.password" type="password" icon="ios-locked-outline"></i-input>
			<i-button type="primary" size="large" v-on:click="loginAndSave()" :loading="loading">登录</i-button>
			<br><br>
		    <!-- <i-button type="error" size="large" v-on:click="next()">下一页</i-button> -->
		</div>
		<!-- <a v-link="{path: '/dashboard'}">Dashboard</a> -->
	</div>
</template>

<script>
	export default {
		async ready(){
			let items = await this.$Auth.getEmailAndPassword();
			this.formInline.email = items.email;
			this.formInline.password = items.password;
		},

		data() {
			return {
				formInline: {
					email: '',
					password: '',
				},
				loading: false
			};
		},

		methods: {
			async loginAndSave () {
				var self = this;
				if(!self.formInline.email || !self.formInline.password){
					return false;
				}
				this.$data.loading = true;
				if(await self.$Auth.checkUserName()){
					self.$emit('logged-in', 123);
					// chrome.tabs.create({
					// 	url: 'http://iems.shinetechchina.com.cn/MyIems/taskes/mytaskes.aspx'
					// });
				}else{
					self.formInline.token = await self.$Auth.getRequestVerificationToken();
					self.$Auth.login(self.formInline).then(function(logined){
						self.$emit('logged-in', 234);
					});	
				}
				chrome.storage.sync.set(this.formInline, () => {});
			},

			next: function(){
				this.$Auth.getUserProfile().then(function(){
					console.info(arguments);
				});
				console.info(this.$router.go('/dashboard'));
			}
		},

		events: {
			'logged-in': function() {
				this.$router.go('/dashboard');
				this.$data.loading = false;
				// chrome.tabs.create({
				// 	url: 'http://iems.shinetechchina.com.cn/MyIems/taskes/mytaskes.aspx'
				// });
			}
		}
	}
</script>
