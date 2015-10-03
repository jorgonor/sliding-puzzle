'use strict';

angular.module('puzzleApp', ['ionic', 'puzzleControllers', 'puzzleServices'])
.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		console.log("on $ionicPlatform.ready");
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if(window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
})

.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

	$stateProvider
	.state('index', {
		url: '/index',
		templateUrl: 'partials/index.html',
		controller: 'IndexCtrl'
	})
	.state('gallery', {
	    url: '/gallery',
        cache: false,
		templateUrl: 'partials/gallery.html',
		controller: 'GalleryCtrl'
	})
	.state('puzzleSelect', {
		url: '/puzzle/select/:src',
        cache: false,
		templateUrl: 'partials/puzzle-select.html',
		controller: 'SelectCtrl'
	})
	.state('play', {
		url: '/puzzle/play/:size/:src',
        cache: false,
		templateUrl: 'partials/play.html',
		controller: 'PlayCtrl'
	});
	
	$urlRouterProvider.otherwise('/index');
}]);