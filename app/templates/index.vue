<template>
	<div id="login">
		<div style="text-align:center">
			<p class="main-title">
				<img src="../images/logo.png">
			</p>
		</div>
		<div>
			<i-input size="large" placeholder="用户名" :value.sync="formInline.user" type="email" icon="ios-email-outline"></i-input>
			<i-input size="large" placeholder="密码" :value.sync="formInline.password" type="password" icon="ios-locked-outline"></i-input>
			<p class="i-switch">
				<Switch></Switch>
				记住我
			</p>
			<i-button type="primary" size="large">登录</i-button>
		</div>
		<!-- <a v-link="{path: '/dashboard'}">Dashboard</a> -->
	</div>
</template>
<script>
	export default {
		data () {
			return {
				formInline: {
					user: 'huangjg@shinetechchina.com',
					password: 'Shinetech2014'
				}
			}
		}
	}
</script>
