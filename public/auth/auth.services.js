/*
All services will be chained from the as object defined in 
auth.module.js (main module).
*/
angular.module('auth').factory('AuthServices', ['$http', '$q', '$localStorage', 'apiHost', function($http, $q, $localStorage, apiHost){
	return {
		register: function(registerForm){
			return $http.post( apiHost + '/register', registerForm );
		},
		login: function(loginForm){
			return $http.post( apiHost + '/login', loginForm );
		},
		getPassword: function(userEmail){
			return $http.post( apiHost + '/getPassword', userEmail);
		},
		isAuthenticated: function(){
			if($localStorage.token){
				return true;
			} 
			else if(!$localStorage.token){
				return false;
			}
		}
	};
}]);