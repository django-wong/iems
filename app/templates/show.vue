<template>
	<div id="show">
		<Card :bordered="false" dis-hover>
	        <p slot="title">
	        	<a v-link="{path: '/dashboard'}"><Icon type="chevron-left"></Icon></a>
	        	{{ item.ProjectName }}
	        </p>
			<p>主联系人: <span>{{ item.PrimaryContact }}</span></p>
	        <p>结束日期: <span>{{ item.DueDate }}</span></p>
	        <p>剩余小时数: <span>{{ item.RemainingHours }}小时</span></p>
	        <p>项目编号: <span>{{ item.ProjectCode }}</span></p>
	        <p>PO类型: <span>{{ item.POType }}</span></p>
	        <p>签订日期: <span>{{ item.DateSigned }}</span></p>
	        <p>开始日期: <span>{{ item.StartDate }}</span></p>
	        <p>小时数: <span>{{ item.POHours }}小时</span></p>
	        <p>单价: <span>{{ item.UnitPrice }} {{ item.Unit }}</span></p>
			<p>总价: <span>{{ item.TotalValue }} {{ item.Unit }}</span></p>
	        <p>PO编号: <span>{{ item.PONo }}</span></p>
        </Card>
        <div class="input-group">
        	<i-input icon="ios-information-outline" placeholder="标题" :value.sync="title"></i-input>
        	<Input-number :max="8" :min="0" :value.sync="hours" @keyup.enter="record(item)" :disabled="item ? item.data.recording : true"></Input-number>
        	<i-input type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="描述" :value.sync="desc"></i-input>
        	<i-button type="primary" icon="ios-color-wand" long v-on:click="record(item)">带我飞</i-button>
        </div>
	</div>
</template>
<script>
	export default {
		ready: function(){
			let item = this.$Project.obtainProject(this.$route.params.id);
			this.$data.item = item;
		},

		data: function(){
			var self = this;
			var data = {
				hours: 0,
				title: '',
				desc: '',
				item: {}
			};
			return data;
		},

		methods: {
			toggleStar: function(item){
				// TODO: STAR AND PINNED
			},

			show: function(item){
				this.$router.go({
					name: 'show',
					params: {
						item: item
					}
				});
			},

			record: function(item){
				var self = this;
				let title = this.$data.title;
				let hours = this.$data.hours;
				let desc = this.$data.desc;
				console.info(hours, title, desc);
				self.$Project.recordWorkload(item, hours, title, desc).then(function(status){
					if(status){
						self.$Message.info(`记录成功`);
					}
				});
			}
		}
	}
</script>