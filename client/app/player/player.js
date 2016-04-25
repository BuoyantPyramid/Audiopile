angular.module('jam.player', [])
.controller('PlayerController', ['$scope', '$rootScope', '$timeout', 'Songs', function($scope, $rootScope, timeout, Songs) {
  
  $scope.isTouchDevice = 'ontouchstart' in document.documentElement;
  $scope.audio = Songs.getPlayer();
  $scope.song = Songs.getCurrentSong();
  $scope.playlist = Songs.getSoundsAndIndex();
  $scope.muted = Songs.getMuted();
  $scope.timeFormat = '00:00';
  $scope.playable = Songs.getPlayable();
  $scope.timeSliderDisabled = !$scope.playable || $scope.isTouchDevice;

  $scope.snapVol = function() {
    if ($scope.audio.volume < 0.05) {
      $scope.mute();
    }
  };

  $scope.speeds = [0.5, 0.8, 1.0, 1.5, 2.0];

  setInterval(function() { $scope.$apply(); }, 200);

  $scope.showSpeed = false;
  
  $scope.$watch(function(scope) {
    return scope.audio.volume;
  }, function(newV, oldV) {
    if (newV) {
      if ($scope.muted) {
        Songs.setMuted(false);
        $scope.muted = false;
      }
    }
  });

  $scope.$watch(function(scope) {
    return scope.audio.currentTime;
  }, function(newV, oldV) {
    $scope.timeFormat = Songs.timeFormat(newV);
  });

  $scope.stop = function () {
    $scope.audio.pause();
    $scope.audio.currentTime = 0;

  };

  $scope.mute = function () {
    if ($scope.muted) {
      $scope.audio.volume = Songs.getVolume();
    } else {
      $scope.audio.volume = 0;
    }
    $scope.muted = !$scope.muted;
    Songs.setMuted($scope.muted);
  };

  $scope.changeTrack = function (direction) {
    var currentSongIndex = Songs.getSongIndex();
    if (direction === 'back') {
      if (currentSongIndex === 0) {
        $scope.stop();
        $scope.audio.play();
      } else {
        Songs.setSongIndex(currentSongIndex - 1);
      }
    }
    if (direction === 'forward') {
      if (currentSongIndex === $scope.playlist.songs.length - 1) { 
        Songs.resetPlayer();
        $scope.song = Songs.getCurrentSong();       
      } else {
        Songs.setSongIndex(currentSongIndex + 1);
      }
    }
  };

  $scope.setSpeed = function (inc) {
    var currentIndex = $scope.speeds.indexOf($scope.audio.playbackRate);
    nextIndex = currentIndex + inc;
    if (nextIndex < 0) {
      nextIndex = 0;
    }
    if (nextIndex >= $scope.speeds.length) {
      nextIndex = $scope.speeds.length - 1;
    }
    $scope.audio.playbackRate = $scope.speeds[nextIndex];
  };

  $scope.togglePlay = function () {
    if ($scope.audio.paused) {
      $scope.audio.play();
    } else {
      $scope.audio.pause();
    }
    // TODO: use broadcastEvent function here
    // broadcastEvent('TOGGLE_PLAY');
    $rootScope.$broadcast('audioPlayerEvent', 'TOGGLE_PLAY');
  };

  var changeSong = function() {
    $scope.playlist = Songs.getSoundsAndIndex();
    $scope.song = $scope.playlist.songs[$scope.playlist.index];
    $scope.audio.src = $scope.song.address || null;
    $scope.audio.onended = Songs.nextIndex;
    $scope.audio.ondurationchange = function(e) {
      $scope.timeSliderDisabled = !$scope.audio.duration || $scope.isTouchDevice;
      Songs.setPlayable(!!$scope.audio.duration);
      $scope.playable = Songs.getPlayable();
    };
    $scope.audio.play();
  };

  var resetPlayer = function() {
    $scope.stop();
    $scope.audio = Songs.getPlayer();
    $scope.playlist = Songs.getSoundsAndIndex();
    $scope.timeSliderDisabled = !$scope.audio.duration;
  };

  var refreshList = function() {
    $scope.playlist = Songs.getSoundsAndIndex();
    $scope.timeSliderDisabled = !$scope.audio.duration;
  };

  // broadcast audio events to all views
  var broadcastEvent = function(event) {
    $rootScope.$broadcast('audioPlayerEvent', event);
  };

  Songs.registerObserverCallback('CHANGE_SONG', changeSong);
  Songs.registerObserverCallback('TOGGLE_PLAY', $scope.togglePlay);
  Songs.registerObserverCallback('RESET_PLAYER', resetPlayer);
  Songs.registerObserverCallback('REFRESH_LIST', refreshList);
  Songs.registerObserverCallback('ANY_AUDIO_EVENT', broadcastEvent);
}]);
