/*
All objects are being defined in main modules in an attempt to optimize organization 
and easy understanding while keeping maximum modularity.
*/
var authModule = angular.module('auth', ['ui.router', 'ngStorage', 'ngMaterial']); // feature main module

// Config and States
authModule.config(function($stateProvider){
	$stateProvider
		.state('welcome', {
	      url: "/welcome",
	      templateUrl: "/auth/views/welcome.html",
	      data: {
	        loginRequired: false
	      }
	    })
	    .state('login', {
	      url: "/login",
	      templateUrl: "/auth/views/login.html",
	      controller: 'AuthCtrl',
	      data: {
	        loginRequired: false
	      }
	    })
	    .state('register', {
	      url: "/register",
	      templateUrl: "/auth/views/register.html",
	      controller: 'AuthCtrl',
	      data: {
	        loginRequired: false
	      }
	    })
	    .state('getPassword', {
	      url: "/forgot-password",
	      templateUrl: "/auth/views/forgot-password.html",
	      controller: 'AuthCtrl',
	      data: {
	        loginRequired: false
	      }
	    });
});