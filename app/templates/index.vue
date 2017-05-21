<template>
	<div id="login">
		<div style="text-align:center">
			<p class="main-title">
				<img src="../images/logo.png">
			</p>
		</div>
		<div>
			<i-input size="large" placeholder="Email" :value.sync="formInline.email" type="email" icon="ios-email-outline"></i-input>
			<i-input size="large" placeholder="Password" :value.sync="formInline.password" type="password" icon="ios-locked-outline"></i-input>
			<i-button type="primary" size="large" v-on:click="loginAndSave()" :loading="loading">{{ 'login' | i18n }}</i-button>
			<br><br>
		</div>
	</div>
</template>

<script>
	var i18n = chrome.i18n.getMessage;
	export default {
		async ready(){
			let items = await this.$Auth.getEmailAndPassword();
			this.formInline.email = items.email;
			this.formInline.password = items.password;
			var self = this;
			if(items.email && items.password){
				self.loginAndSave();
			}
		},

		data() {
			return {
				formInline: {
					email: '',
					password: ''
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
					self.$emit('logged-in');
				}else{
					self.formInline.token = await self.$Auth.getRequestVerificationToken();
					if(!self.formInline.token){
						self.$Message.error(i18n('fetchTokenFailed'), 5);
					}
					self.$Auth.login(self.formInline).then(function(result){
						if(result){
							self.$emit('logged-in');
						}else{
							self.loading = false;
							self.$Message.error(i18n('unmeetError'), 5);
						}
					});	
				}
				chrome.storage.sync.set(this.formInline, () => {});
			},

			next: function(){
				this.$Auth.getUserProfile().then(function(){
					console.info(arguments);
				});
				this.$router.go('/dashboard');
			}
		},

		events: {
			'logged-in': function() {
				this.$router.go('/dashboard');
				this.$data.loading = false;
			}
		}
	}
</script>
