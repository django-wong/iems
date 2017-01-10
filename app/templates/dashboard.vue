<template>
	<div id="dashboard">
		<div class="header-center">
			<Button-group size="small">
		        <i-button type="ghost" class="active">项目</i-button>
		        <i-button type="ghost">个人</i-button>
		        <i-button type="ghost">设置</i-button>
		    </Button-group>
		</div>
	    <Card :bordered="true" v-for="item in items" track-by="$index" dis-hover v-on:click="show(item)">
            <p slot="title">
            	<Icon v-if="item.stared" type="ios-star" v-on:click="toggleStar(item)"></Icon>
            	<Icon v-else type="ios-star-outline" v-on:click="toggleStar(item)"></Icon>
            	{{ item.ProjectName }}
            </p>
			<p>主联系人: <span>{{ item.PrimaryContact }}</span></p>
            <p>结束日期: <span>{{ item.DueDate }}</span></p>
            <p>剩余小时数: <span>{{ item.RemainingHours }}小时</span></p>
            <p>项目编号: <span>{{ item.ProjectCode }}</span></p>
            <!-- <p>PO类型: <span>{{ item.POType }}</span></p>
            <p>PO编号: <span>{{ item.PONo }}</span></p>
            <p>签订日期: <span>{{ item.DateSigned }}</span></p>
            <p>开始日期: <span>{{ item.StartDate }}</span></p>
            <p>小时数: <span>{{ item.POHours }}</span></p>
            <p>单价: <span>{{ item.UnitPrice }} {{ item.Unit }}</span></p>
			<p>总价: <span>{{ item.TotalValue }} {{ item.Unit }}</span></p> -->
        </Card>
	</div>
	<!-- <a v-link="{path: '/'}">LOGIN</a> -->
</template>
<script>
	export default {
		data: function(){
			var self = this;
			var data = {
				items: []
			};
			this.$Project.getProjects().then(function(items){
				self.$data.items = items;
			});
			return data;
		},

		methods: {
			toggleStar: function(item){
				// TODO: STAR AND PINNED
			},

			show: function(item){
				console.info(`/show/${item.ProjectCode}`);
				this.$router.go(`/show/${item.ProjectCode}`);
			}
		}
	}
</script>