<template>
	<div id="show">
		<Card :bordered="false" dis-hover>
	        <p slot="title">
	        	<a v-link="{path: '/dashboard'}"><Icon type="chevron-left"></Icon></a>
	        	{{ item.ProjectName }}
	        </p>
	        <Alert>保存项目常量</Alert>
	        <div class="input-group">
	        	<i-input icon="ios-information-outline" placeholder="标题" :value.sync="title"></i-input>
	        	<Input-number :max="8" :min="0" :value.sync="hours"></Input-number>
	        	<i-input type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="描述" :value.sync="desc"></i-input>
	        	<i-button type="primary" icon="ios-color-wand" long v-on:click="save(item)">保存</i-button>
	        </div>
        </Card>
	</div>
</template>
<script>
	export default {
		ready: function(){
			let item = this.$Project.obtainProject(this.$route.params.id);
			this.$data.item = item;
			this.$data.hours = item.data.hours;
			this.$data.title = item.data.title;
			this.$data.desc = item.data.desc;
		},

		data: function(){
			var self = this;
			var data = {
				hours: 8,
				title: '',
				desc: '',
				item: {},
				loadingChart: true
			};
			return data;
		},

		methods: {
			save: async function(item){
				var self = this;
				this.$Project.setPerference(item.projectCode, this.hours, this.title, this.desc).then(function(){
					self.$Message.info(`${item.ProjectName}保存成功`);
				});
			}
		}
	}
</script>