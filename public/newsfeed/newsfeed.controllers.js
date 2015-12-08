/*
All controllers will be chained from the nfc object defined in 
newsfeed.module.js (main module).
*/
angular.module('newsfeed').controller('NewsfeedCtrl', ['$scope', 'MainFeedService', function($scope, MainFeedService){
	
	// Gets a feed from the API
	MainFeedService.artFeed()
	.success(function(data, status, config, headers){
		$scope.newsfeed = data.data;
	});
}]);

