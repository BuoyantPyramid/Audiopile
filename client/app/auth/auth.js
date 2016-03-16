angular.module('jam.auth', [])

.controller('AuthController', ['$scope', '$window', '$location', 'Auth', function ($scope, $window, $location, Auth) {
  $scope.user = {};

  $scope.login = function () {
    Auth.login($scope.user)
      .then(function (data) {
        $window.localStorage.setItem('com.jam', data.token);
        $rootScope.user = data.user;
        $location.path('/songs');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    $scope.user.displayName = 'anonymous';
    Auth.signup($scope.user)
      .then(function (data) {
        $window.localStorage.setItem('com.jam', data.token);
        $rootScope.user = data.user;
        $location.path('/profile');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.logout = function () {
    Auth.logout();
  };
}]);
