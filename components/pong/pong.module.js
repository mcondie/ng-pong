'use strict';
/*jshint esnext: true */

function PongConfig($urlRouterProvider, $stateProvider){
	$urlRouterProvider.otherwise('/');

	$stateProvider.state('error', {
		url: '/error',
		templateUrl: 'components/error/error.html'
	})
	.state('home', {
		controller: "PongController",
		controllerAs: "pong",
		url: "/",
		templateUrl: "components/pong/pong.html",
		resolve: {
			
		}
	});
}

angular.module('pong', [
	'ui.router'
	])
.config(PongConfig)