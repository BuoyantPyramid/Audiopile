angular.module('jam.profile', [])

.controller('ProfileController', function ($scope, $location, Profile, Auth, $rootScope) {
  if (!$rootScope.user) {
    Auth.logout();
  }
  $scope.profile = $rootScope.user;
  $scope.updateProfile = function () {
    Profile.updateUser($scope.profile)
    .then(function (res) {
      console.log('Profile updated', res.data);
      $location.path('/songs');
    })
    .catch(function (error) {
      console.error(error);
    });
  };
});