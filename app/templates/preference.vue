<template>
	<div id="show">
		<Card :bordered="false" dis-hover>
	        <p slot="title">
	        	<a v-link="{path: '/dashboard'}"><Icon type="chevron-left"></Icon></a>
	        	{{ item.ProjectName }}
	        </p>
	        <Alert>{{ 'preference' | i18n }}</Alert>
	        <div class="input-group">
	        	<i-input icon="ios-information-outline" placeholder="Title" :value.sync="title"></i-input>
	        	<Input-number :max="8" :min="0" :value.sync="hours"></Input-number>
	        	<i-input type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Desc" :value.sync="desc"></i-input>
				<p>
					<Switch :checked.sync="excluded" size="large">
						<span slot="open">{{ 'yes' | i18n }}</span>
						<span slot="close">{{ 'no' | i18n }}</span>
					</Switch>
		        	<span>{{ 'excluded' | i18n }}</span>
				</p>
	        	<i-button type="primary" icon="ios-color-wand" long v-on:click="save(item)">{{ 'save' | i18n }}</i-button>
	        </div>
        </Card>
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
			this.$data.excluded = item.data.excluded;
		},

		data: function(){
			var self = this;
			var data = {
				hours: 8,
				title: '',
				desc: '',
				excluded: false,
				item: {},
				loadingChart: true
			};
			return data;
		},

		methods: {
			save: async function(item){
				var self = this;
				this.$Project.setPerference(item.ProjectCode, this.hours, this.title, this.desc, this.excluded).then(function(){
					self.$Message.info(`${item.ProjectName} ${i18n('saved')}`);
				});
			}
		}
	}
</script>