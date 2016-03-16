angular.module('jam.services', [])

.factory('Songs', ['$http', function (http) {

  var addSong = function (song, groupId) {
    return http({
      method: 'POST',
      url: '/api/groups/' + groupId + '/songs/',
      data: song
    })
    .then(function (res) {
      return res;
    });
  };


  var getAllSongs = function (groupId) {
    return http({
      method: 'GET',
      url: '/api/groups/' + groupId + '/songs/'
    })
    .then(function (res) {
      return res.data;
    });
  };

  return {
    addSong: addSong,
    getAllSongs: getAllSongs
  };
}])

.factory('Profile', ['$http', function(http) {
  var updateUser = function(profile) {
    return http({
      method: 'PUT',
      url: '/api/users/profile',
      data: profile
    });
  };
  var getProfile = function(profile) {
    return http({
      method: 'GET',
      url: '/api/users/profile'
    });
  };

  return {
    updateUser: updateUser,
    getProfile: getProfile
  };
}])

.factory('Auth', ['$http', '$location', '$window', function (http, loc, win) {
  // This is responsible for authenticating our user
  // by exchanging the user's email and password
  // for a JWT from the server
  // that JWT is then stored in localStorage as 'com.jam'

  var userData = null;

  var login = function (user) {
    return http({
      method: 'POST',
      url: '/api/users/login',
      data: user
    })
    .then(function (resp) {
      userData = resp.data.user;
      win.localStorage.setItem('com.jam', resp.data.token);
      return resp.data;
    });
  };

  var signup = function (user) {
    return http({
      method: 'POST',
      url: '/api/users/signup',
      data: user
    })
    .then(function (resp) {
      userData = resp.data.user;
      win.localStorage.setItem('com.jam', resp.data.token);
      return resp.data;
    });
  };

  var getUser = function(userId) {
    console.log('services headers:', win.localStorage.getItem('com.jam'));
    return http({
      method: 'GET',
      url: '/api/users/' + userId
    })
    .then(function(resp) {
      return resp.data;
    });
  };

  var getUserData = function() {
    return userData;
  };

  var isAuth = function () {
    return !!win.localStorage.getItem('com.jam');
  };

  var logout = function () {
    win.localStorage.removeItem('com.jam');
    userData = null;
    loc.path('/login');
  };

  return {
    login: login,
    signup: signup,
    getUser: getUser,
    isAuth: isAuth,
    logout: logout,
    getUserData: getUserData
  };
}]);
