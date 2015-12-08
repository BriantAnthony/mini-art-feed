angular.module('newsfeed').factory('MainFeedService', ['$http', '$q', '$localStorage', 'apiHost', function($http, $q, $localStorage, apiHost){
	var config = {
		headers: {
			'x-access-token' : $localStorage.token
		}
	};
	return{
		artFeed: function(){
			return $http.get(apiHost + '/artwork', config);
		}
	}
}]);