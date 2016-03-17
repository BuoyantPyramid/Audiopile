angular.module('jam.songs', [])

.controller('SongsController', ['$scope', '$location', 'Songs', 'Auth', function ($scope, loc, Songs, Auth) {
  // When user adds a new link, put it in the collection
  $scope.data = {};
  $scope.logout = Auth.logout;

  Auth.getUserData()
  .then(function (user) {
    $scope.user = user;
    $scope.data.songs = user.currentGroup.songs;
  })
  .catch(console.error);
}]);
