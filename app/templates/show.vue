<template>
	<div id="show">
		<Card :bordered="false" dis-hover>
	        <p slot="title">
	        	<a v-link="{path: '/dashboard'}"><Icon type="chevron-left"></Icon></a>
	        	{{ item.ProjectName }}
	        </p>
			<p>{{ 'primaryContact' | i18n }}: <span>{{ item.PrimaryContact }}</span></p>
	        <p>{{ 'dueDate' | i18n }}: <span>{{ item.DueDate }}</span></p>
	        <p>{{ 'remainingHours' | i18n }}: <span>{{ item.RemainingHours }}{{ 'hours' | i18n }}</span></p>
	        <p>{{ 'projectCode' | i18n }}: <span>{{ item.ProjectCode }}</span></p>
	        <p>{{ 'poType' | i18n }}: <span>{{ item.POType }}</span></p>
	        <p>{{ 'dateSigned' | i18n }}: <span>{{ item.DateSigned }}</span></p>
	        <p>{{ 'startDate' | i18n }}: <span>{{ item.StartDate }}</span></p>
	        <p>{{ 'phHours' | i18n }}: <span>{{ item.POHours }}小时</span></p>
	        <p>{{ 'unitPrice' | i18n }}: <span>{{ item.UnitPrice }} {{ item.Unit }}</span></p>
			<p>{{ 'totalValue' | i18n }}: <span>{{ item.TotalValue }} {{ item.Unit }}</span></p>
	        <p>{{ 'poNo' | i18n }}: <span>{{ item.PONo }}</span></p>
        </Card>
        <div class="input-group">
        	<i-input icon="ios-information-outline" placeholder="title" :value.sync="title"></i-input>
        	<Input-number :max="8" :min="0" :value.sync="hours" @keyup.enter="record(item)" :disabled="item ? item.data.recording : true"></Input-number>
        	<i-input type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="desc" :value.sync="desc"></i-input>
        	<i-button type="primary" icon="ios-color-wand" long v-on:click="record(item)">{{ 'letsRock' | i18n }}</i-button>
        </div>
        <div id="grap">
        	<Spin :fix="true" v-if="loadingChart">
	            <Icon type="load-c" size=18 class="spin-icon-load"></Icon>
	        </Spin>
        </div>
	</div>
</template>
<script>
	var i18n = chrome.i18n.getMessage;
	export default {
		ready: function(){
			let item = this.$Project.obtainProject(this.$route.params.id);
			this.$data.item = item;
			this.$data.hours = item.data.hours;
			this.$data.title = item.data.title;
			this.$data.desc = item.data.desc;
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
					title: i18n('totalInThisMonth', [items.total]),
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
				hours: 8,
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
						self.$Message.info(i18n('recorded'));
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