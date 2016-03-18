angular.module('jam.auth', [])

.controller('AuthController', ['$scope', '$window', '$location', 'Auth',
function ($scope, $window, $location, Auth) {
  $scope.confirm = false;
  $scope.passMismatch = false;
  $scope.user = {};
  $scope.login = function () {
    Auth.login($scope.user)
      .then(function (data) {
        $location.path('/songs');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function (pass) {
    if (pass === $scope.user.password) {
      $scope.passMismatch = false;
      $scope.user.displayName = 'anonymous';
      Auth.signup($scope.user)
        .then(function (data) {
          $location.path('/profile');
        })
        .catch(function (error) {
          console.error(error);
        });
    } else {
      $scope.newPassword = '';
      $scope.passMismatch = true;
      $scope.user.password = '';
    }
  };

  $scope.logout = function () {
    Auth.logout();
    $scope.user = null;
  };
}]);
