<template>
	<div id="dashboard" class="has-float-footer">
		<div class="header-center">
			<Button-group size="small">
		        <i-button type="ghost" v-link="{path: '/dashboard'}" class="active">项目</i-button>
		        <i-button type="ghost" v-link="{path: '/alarm'}">定时任务</i-button>
		        <i-button type="ghost" v-link="{path: '/account'}">个人</i-button>
		    </Button-group>
		</div>

		<Spin fix="true" v-if="loading">
            <Icon type="load-c" size=18 class="spin-icon-load"></Icon>
            <div>Loading</div>
        </Spin>

		<div v-for="item in items" track-by="$index">
		    <Card :bordered="true" dis-hover class="project-card">
	            <p slot="title">
	            	<!-- <Icon v-if="item.stared" type="ios-star" v-on:click="toggleStar(item)"></Icon>
	            	<Icon v-else type="ios-star-outline" v-on:click="toggleStar(item)"></Icon> -->
	            	<Icon class="project-action" type="gear-a" v-link="{path:'/preference/'+item.ProjectCode}"></Icon>
	            	<a v-link="{path:'/show/'+item.ProjectCode}">{{ item.ProjectName }}</a>
	            </p>
				<p>主联系人: <span>{{ item.PrimaryContact }}</span></p>
	            <p>结束日期: <span>{{ item.DueDate }}</span></p>
	            <p>剩余小时数: <span>{{ item.RemainingHours }}小时</span></p>
	            <p>项目编号: <span>{{ item.ProjectCode }}</span></p>
				<div class="quick-do">
					<Input-number :max="8" :min="0" :value.sync="item.data.hours" @keyup.enter="record(item)" :disabled="item.data.recording"></Input-number>
				</div>
	        </Card>
		</div>

        <Alert show-icon v-if="!items.length && !loading">
	        啥玩意儿没有
	        <Icon type="ios-lightbulb-outline" slot="icon"></Icon>
	        <template slot="desc">这就让人尴尬了...</template>
	    </Alert>

	    <div class="float-footer">
	    	<i-button type="primary" long v-on:click="quickRecords()">一键领工资</i-button>
	    </div>
	</div>
	<!-- <a v-link="{path: '/'}">LOGIN</a> -->
</template>
<script>
	export default {
		data: function(){
			var self = this;
			var data = {
				items: [],
				loading: true,
				is_number: true
			};
			this.$Project.getProjects().then(function(items){
				self.$data.items = items;
				self.$data.loading = false;
			});
			return data;
		},

		methods: {
			show: function(item){
				this.$router.go(`/show/${item.ProjectCode}`);
			},

			record: function(item){
				var self = this;
				var hours = item.data.hours;
				if(!hours){
					return this.$Message.error('你填个零让我怎么想?');
				}
				this.$Project.recordWorkload(item, item.data.hours, 'IEMS JETPACK', 'IEMS JETPACK DESCRIPTIONS').then(function(status){
					if(status){
						self.$Message.info('记录成功');
					}else{
						self.$Message.error('记录失败');
					}
				});
			},

			quickRecords: function(){
				var self = this;
				this.$data.items.forEach(function(item){
					console.info('需填: ', item.data.hours);
					self.$Project.recordWorkload(item, item.data.hours, '', '').then(function(status){
						if(status){
							self.$Message.info(`${item.ProjectName}记录成功`);
						}else{
							self.$Message.error(`${item.ProjectName}记录失败`);
						}
					});
				});
			},

			toggleStar: function(){
				this.$Message.info('它还不能点');
			}
		}
	}
</script>