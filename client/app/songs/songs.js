angular.module('jam.songs', [])

.controller('SongsController', ['$scope', '$location', 'Songs', 'Auth', function ($scope, loc, Songs, Auth) {
  // When user adds a new link, put it in the collection
  $scope.data = {};
  $scope.user = {};

  $scope.refreshSongs = function() {
    Songs.getAllSongs($scope.user.currentGroupId)
    .then(function(songs) {
      $scope.data.songs = songs;
    })
    .catch(console.error);
  };

  Auth.getUserData(true)
  .then(function (user) {
    $scope.user = user;
    $scope.data.songs = user.currentGroup.songs;
  })
  .catch(console.error);
}]);
