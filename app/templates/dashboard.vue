<template>
	<div id="dashboard" class="has-float-footer">
		<div class="header-center">
			<Button-group size="small">
		        <i-button type="ghost" v-link="{path: '/dashboard'}" class="active">{{ 'projects' | i18n }}</i-button>
		        <i-button type="ghost" v-link="{path: '/alarm'}">{{ 'cron' | i18n }}</i-button>
		        <i-button type="ghost" v-link="{path: '/account'}">{{ 'me' | i18n }}</i-button>
		    </Button-group>
		</div>

		<Spin :fix="true" v-if="loading">
            <Icon type="load-c" size=18 class="spin-icon-load"></Icon>
            <div>{{ 'loading' | i18n }}</div>
        </Spin>

		<div v-for="item in items" track-by="$index">
		    <Card :bordered="true" dis-hover class="project-card">
	            <p slot="title">
	            	<Icon class="project-action" type="gear-a" v-link="{path:'/preference/'+item.ProjectCode}"></Icon>
	            	<a v-link="{path:'/show/'+item.ProjectCode}">{{ item.ProjectName }}</a>
	            </p>
				<p>{{ 'primaryContact' | i18n }}: <span>{{ item.PrimaryContact }}</span></p>
	            <p>{{ 'dueDate' | i18n  }}: <span>{{ item.DueDate }}</span></p>
	            <p>{{ 'remainingHours' | i18n  }}: <span>{{ item.RemainingHours }}{{ 'hour' | i18n }}</span></p>
	            <p>{{ 'projectCode' | i18n  }}: <span>{{ item.ProjectCode }}</span></p>
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
	    	<i-button type="primary" long v-on:click="quickRecords()">{{ 'applyAll' | i18n }}</i-button>
	    </div>
	</div>
</template>
<script>
	var i18n = chrome.i18n.getMessage;
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
					return this.$Message.error(i18n('kidding'));
				}
				this.$Project.recordWorkload(item, item.data.hours, 'IEMS JETPACK', 'IEMS JETPACK DESCRIPTIONS').then(function(status){
					if(status){
						self.$Message.info(i18n('recorded'));
					}else{
						self.$Message.error(il8n('recordFailed'));
					}
				});
			},

			quickRecords: function(){
				var self = this;
				this.$data.items.forEach(function(item){
					self.$Project.recordWorkload(item, item.data.hours, '', '').then(function(status){
						if(status){
							self.$Message.info(`${item.ProjectName} ${i18n('recorded')}`);
						}else{
							self.$Message.error(`${item.ProjectName} ${il8n('recordFailed')}`);
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