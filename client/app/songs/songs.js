angular.module('jam.songs', [])

.controller('SongsController', ['$scope', '$location', 'Songs', 'Users', 'Groups', function ($scope, loc, Songs, Users, GR) {
  // When user adds a new link, put it in the collection
  $scope.data = {};
  $scope.user = {};
  $scope.time = null;
  $scope.timeFormat = '00:00';
  $scope.comment = {};
  $scope.message = '';
  $scope.commentSong = {};
  $scope.where = 'songs';
  Songs.setViewLocation($scope.where);
  $scope.playable = Songs.getPlayable();

  // $scope.$on('audioPlayerEvent', function(event, data) {
  //   $scope.broadcastTest = event + ' ' + data;
  //   console.log('EVENT');
  // });

  $scope.updateIndex = function(index) {
    console.log('Update index: ', index, $scope.where);

    Songs.choose(index, $scope.where);
  };

  Users.getUserData()
  .then(function (user) {
    $scope.user = user;
    $scope.refreshSongs();
    console.log('Get user data: ', $scope.user);
    GR.getPlaylistsByGroupId($scope.user.currentGroup.id)
    .then(function (playlists) {
      $scope.data.playlists = playlists;
    });
  })
  .catch(console.error);
  
  $scope.addToPlaylist = function(playlist) {
    $scope.newSong.playlistId = playlist.id;
    var index = playlist.length;
    console.log('the playlist: ', playlist);
    Songs.addSongToPlaylist($scope.newSong.id, playlist.id, index)
    .then(function (resp) {
      // tell user song was added
      console.log(resp);
    })
    .catch(console.error);
  };

  $scope.getTime = function () {
    $scope.time = Songs.getPlayer().currentTime;
    $scope.timeFormat = Songs.timeFormat($scope.time);
  };

  $scope.toggleCommentModal = function (song, userId) {
    $scope.commentSong = song;
    var playingSong = Songs.getCurrentSong();
    if (playingSong && playingSong.id === song.id) {
      $scope.getTime();
    }
    $scope.commentModalShown = !$scope.commentModalShown;
  };

  $scope.addComment = function() {
    $scope.comment.time = $scope.time;
    $scope.comment.userId = $scope.user.id;
    Songs.addComment($scope.comment, $scope.commentSong.id)
    .then(function(comment) {
      $scope.comment = {};
      $scope.time = null;
      $scope.commentModalShown = false;
      $scope.message = 'comment posted: ' + comment;
    });
  };


  $scope.toggleAddModal = function () {
    $scope.addModalShown = !$scope.addModalShown;
  };

  $scope.refreshSongs = function() {
    Songs.getAllSongs($scope.user.currentGroupId)
    .then(function(songs) {
      console.log('Refresh all songs: ', songs);
      $scope.data.songs = songs.sort(function(a, b) {
        if ( a.createdAt > b.createdAt ) {
          return -1;
        } else if ( a.createdAt < b.createdAt ) {
          return 1;
        } else {
          return 0;
        }
      });
    })
    .catch(console.error);
  };

  $scope.makeSongPending = function (song, index) {
    $scope.deleteModalShown = true;
    $scope.pendingSong = song;
    $scope.pendingSong.index = index;
  };

  $scope.deleteSong = function(index) {
    var song = $scope.data.songs[index];
    Songs.checkReset(song.id, 'songs');
    Songs.deleteSong(song)
    .then(function() {
      $scope.deleteModalShown = false;
      $scope.data.songs = _.filter($scope.data.songs, function(currentSong) {
        return currentSong.id !== song.id;
      });
    })
    .catch(function (err) {
      $scope.message = 'error: ' + err;
    });
  };
}]);
