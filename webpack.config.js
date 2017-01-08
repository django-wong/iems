/*
* @Author: Django Wong
* @Date:   2017-01-08 22:46:00
* @Last Modified by:   Django Wong
* @Last Modified time: 2017-01-09 03:32:48
* @File Name: webpack.config.js
*/

'use strict';
module.exports = {
	output: {
		filename: '[name].js'
	},
	module: {
		loaders: [
			{
				test: /\.vue$/,
				loader: 'vue'
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				loaders: [
					'url-loader'
				]
			}
		]
	}
};