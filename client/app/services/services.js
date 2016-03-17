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
 
}])

.factory('Auth', ['$http', '$location', '$window', '$q', function (http, loc, win, q) {
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
      return resp.data.user;
    });
  };

  var logout = function () {
    win.localStorage.removeItem('com.jam');
    userData = null;
    loc.path('/login');
  };

  var updateProfile = function(profile) {
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

  var getUserData = function( force ) {
    force = force || false;
    return q(function(resolve, reject) {
      if (userData && !force) {
        resolve(userData);
      }
      getProfile()
      .then(function(response) {
        userData = response.data.user;
        resolve(userData);
      })
      .catch(function (error) {
        reject(error);
      });
    });
  };

  var isAuth = function () {
    return !!win.localStorage.getItem('com.jam');
  };

  return {
    updateProfile: updateProfile,
    getProfile: getProfile,
    login: login,
    signup: signup,
    getUser: getUser,
    isAuth: isAuth,
    logout: logout,
    getUserData: getUserData
  };
}]);
