angular.module('jam.services', [])

.factory('Songs', function ($http) {

  var addSong = function (url) {
    return $http({
      method: 'POST',
      url: '/api/songs',
      data: url
    })
    .then(function (res) {
      return res;
    });
  };


  var getAllSongs = function () {
    return $http({
      method: 'GET',
      url: '/api/songs'
    })
    .then(function (res) {
      return res.data;
    });
  };

  return {
    addSong: addSong,
    getAllSongs: getAllSongs
  };
})
.factory('Profile', function($http) {
  var updateUser = function(profile) {
    return $http({
      method: 'PUT',
      url: '/api/user',
      data: profile
    });
  };
})
.factory('Auth', function ($http, $location, $window) {
  // This is responsible for authenticating our user
  // by exchanging the user's username and password
  // for a JWT from the server
  // that JWT is then stored in localStorage as 'com.jam'
  // after you signin/signup open devtools, click resources,
  // then localStorage and you'll see your token from the server
  var signin = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signin',
      data: user
    })
    .then(function (resp) {
      return resp.data.token;
    });
  };

  var signup = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signup',
      data: user
    })
    .then(function (resp) {
      return resp.data.token;
    });
  };

  var isAuth = function () {
    return !!$window.localStorage.getItem('com.jam');
  };

  var signout = function () {
    $window.localStorage.removeItem('com.jam');
    $location.path('/signin');
  };


  return {
    signin: signin,
    signup: signup,
    isAuth: isAuth,
    signout: signout
  };
});
