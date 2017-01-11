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
        <div id="grap">
        	<Spin fix="true" v-if="loadingChart">
	            <Icon type="load-c" size=18 class="spin-icon-load"></Icon>
	            <div>Loading Chart</div>
	        </Spin>
        </div>
	</div>
</template>
<script>
	export default {
		ready: function(){
			let item = this.$Project.obtainProject(this.$route.params.id);
			this.$data.item = item;
			var self = this;
			this.$History.queryThisMonth(item.PrimaryContact, item.ProjectName).then(function(items){
				self.$data.loadingChart = false;
				var days = moment().daysInMonth();
				var dates = {};
				for (var i = 1; i <= days; i++) {
					let date = moment().set('date', i).format('YYYY-MM-DD');
					dates[date] = {
						hours: 0
					};
				}
				items.forEach(function(item){
					let date = item.work_date;
					dates[date].hours += item.work_hours;
				});
				var data = [];
				for(var i in dates){
					data.push({
						date: i,
						hours: dates[i].hours
					});
				}
				data = MG.convert.date(data, 'date');
				Metrics.data_graphic({
					title: `本月共计${items.total}小时`,
					description: "一看就知道是啥，还用问？",
					data: data,
					width: 220,
					height: 150,
					target: '#grap',
					x_accessor: 'date',
					y_accessor: 'hours',
					xax_count: 6,
					animate_on_load: false,
					show_tooltips: false,
					interpolate: d3.curveLinear,
					show_secondary_x_label: false,
					left: 25,
					right: 15,
					center_title_full_width: true,
					bottom: 20
				});
			});
		},

		data: function(){
			var self = this;
			var data = {
				hours: 0,
				title: '',
				desc: '',
				item: {},
				loadingChart: true
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
			},

			mail: function(item){
				let date = (new Date()).toDateString();
				chrome.runtime.sendMessage({
					handler: 'mailto',
					detail: {}
				}, function(response) {
					console.log(response);
				});
			}
		}
	}
</script>