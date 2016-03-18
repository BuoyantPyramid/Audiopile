angular.module('jam.profile', [])

.controller('ProfileController', ['$scope', '$location', 'Auth', 'FileUploader',
function ($scope, loc, Auth, Up) {
  Auth.getUserData()
  .then(function (userData) {
    $scope.user = userData;
  })
  .catch(console.error);
  
  $scope.uploader = new Up();

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
}]);
