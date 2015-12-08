/*
All objects are being defined in main modules in an attempt to optimize organization 
and easy understanding while keeping maximum modularity.
*/
var nf = angular.module('newsfeed', ['ngMaterial', 'ui.router']); // feature main module

// Config and Routes
nf.config(function($stateProvider){

	$stateProvider
    .state('newsfeed', {
      url: "/newsfeed",
      templateUrl: "/newsfeed/views/newsfeed.html",
      controller: 'NewsfeedCtrl',
      data: {
        loginRequired: true
      }
    });

});