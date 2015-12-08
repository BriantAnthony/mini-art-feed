angular.module('app', [
  'ngMaterial',
  'ui.router',
  'ngStorage',
  'newsfeed',
  'auth'
  ])
  .config(function($mdThemingProvider, $mdIconProvider, $stateProvider, $urlRouterProvider){

    $mdIconProvider
      .defaultIconSet("./assets/svg/avatars.svg", 128)
      .icon("menu"       , "./assets/svg/menu.svg"        , 24)
      .icon("share"      , "./assets/svg/share.svg"       , 24)
      .icon("google_plus", "./assets/svg/google_plus.svg" , 512)
      .icon("hangouts"   , "./assets/svg/hangouts.svg"    , 512)
      .icon("twitter"    , "./assets/svg/twitter.svg"     , 512)
      .icon("phone"      , "./assets/svg/phone.svg"       , 512);

    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('orange');

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/welcome');
  
  })
  //Locking down authenticated routes - redirects user to login view
  .run(['$rootScope', '$state', 'AuthServices', function($rootScope, $state, AuthServices){
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams){
      if(toState.data.loginRequired && !AuthServices.isAuthenticated()) { 
        event.preventDefault();
        $state.go('login');
      }     
    });

  }]);
