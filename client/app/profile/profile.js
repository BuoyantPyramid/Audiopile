angular.module('jam.profile', [])

.controller('ProfileController', ['$scope', '$location', 'Auth',
function ($scope, loc, Auth) {
  Auth.getUserData()
  .then(function (userData) {
    $scope.user = userData;
  })
  .catch(console.error);
  

  $scope.updateProfile = function () {
    Auth.updateProfile($scope.user)
    .then(function (res) {
      console.log('Profile updated', res.data.user);
      $scope.user = res.data.user;
    })
    .catch(function (error) {
      console.error(error);
    });
  };
  $scope.logout = Auth.logout;
}])
.directive('navBar', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/nav/nav.html'
  };
});