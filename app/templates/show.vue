<template>
	<div id="show">
        <p>
        	{{ item.ProjectName }}
        </p>
		<p>主联系人: <span>{{ item.PrimaryContact }}</span></p>
        <p>结束日期: <span>{{ item.DueDate }}</span></p>
        <p>剩余小时数: <span>{{ item.RemainingHours }}小时</span></p>
        <p>项目编号: <span>{{ item.ProjectCode }}</span></p>
        <p>PO类型: <span>{{ item.POType }}</span></p>
        <p>PO编号: <span>{{ item.PONo }}</span></p>
        <p>签订日期: <span>{{ item.DateSigned }}</span></p>
        <p>开始日期: <span>{{ item.StartDate }}</span></p>
        <p>小时数: <span>{{ item.POHours }}</span></p>
        <p>单价: <span>{{ item.UnitPrice }} {{ item.Unit }}</span></p>
		<p>总价: <span>{{ item.TotalValue }} {{ item.Unit }}</span></p>
		<a v-link="{path: '/dashboard'}" >Back</a>
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
			}
		}
	}
</script>