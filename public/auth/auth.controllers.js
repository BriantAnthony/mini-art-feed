/*
All controllers will be chained from the ac object defined in 
auth.module.js (main module).
*/
angular.module('auth').controller('AuthCtrl', ['$scope', '$localStorage', '$state', '$window', 'AuthServices', function($scope, $localStorage, $state, $window, AuthServices){
	$scope.$storage = $localStorage; // Watches $localStorage for changes
	$scope.currentUser = $scope.$storage.currentUser;

	// New user registers an account
	$scope.registerAccount = function(registerForm){
		AuthServices.register(registerForm)
		.success(function(data){
			$localStorage.currentUser = data.data; // sets user object in local storage for data persistence
			$localStorage.token = data.token; // sets auth token in local storage for persistent authentication
			$scope.currentUser = $localStorage.currentUser;

			// Authentication error message handling, ex: 'User not found' or 'Wrong Password'
			if(data.success==false){
				alert(data.message);
			} else {
				$state.go('newsfeed');
			}
		}).error(function(res, status, config, headers){
			alert('Try again later.');
			console.log(res, status, config, headers);
		});
	}

	// User login
	$scope.loginUser = function(loginForm){

		AuthServices.login(loginForm)
		.success(function(data){
			$localStorage.currentUser = data.data; // sets user object in local storage for data persistence
			$localStorage.token = data.token; // sets auth token in local storage for persistent authentication
			$scope.currentUser = $localStorage.currentUser;
			
			// Authentication error message handling, ex: 'User not found' or 'Wrong Password'
			if(data.success==false){
				alert(data.message);
			} else {
				$state.go('newsfeed');
			}
			
			
		}).error(function(res, status, config, headers){
			alert('Try again later.');
			console.log(res, status, config, headers);
		});
	}

	// Password Retrieval -  currently returning in alert box; later to to be emailed to email address on file.
	$scope.getPassword = function(userEmail){
		AuthServices.getPassword(userEmail)
		.success(function(data){
			alert('password: ' + data.data);

			// Retrieval error message handling
			if(data.success==false){
				alert(data.message);
			}
			
		}).error(function(res, status, config, headers){
			alert('Try again later.');
		});
	}

	// Register button click event from home page
	$scope.toRegister = function(){
		$state.go('register');
	}

	// Login button click event from home page
	$scope.toLogin = function(){
		$state.go('login');
	}

	// Logout button click event
	$scope.logoutUser = function(){
		$localStorage.$reset();
		$scope.currentUser = {};
		$state.go('login');
		
	}
}]);