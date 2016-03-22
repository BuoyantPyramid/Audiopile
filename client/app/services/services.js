angular.module('jam.services', [])

.factory('Songs', ['$http', '$q', 'ngAudio', function (http, q, audio) {

  var addSong = function (song, groupId) {
    console.log('Song', song);
    var songData = {
      size: song.size,
      lastModified: song.lastModified,
      name: song.name,
      uniqueHash: song.uniqueFilename,
      address: song.s3url,
      duration: song.duration
    };

    return q(function(resolve, reject) {
      http({
        method: 'POST',
        url: '/api/groups/' + groupId + '/songs/',
        data: songData
      })
      .then(function(response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
    });
  };

  var getAllSongs = function (groupId) {
    return http({
      method: 'GET',
      url: '/api/groups/' + groupId + '/songs/'
    })
    .then(function (res) {
      // this will return the ngAudio objects
      return res.data.reduce(function(songs, song) {
        song.sound = audio.load(song.address);
        songs = songs.concat([song]);
        return songs;
      }, []);
    });
  };

  var deleteSong = function (song) {
    return http({
      method: 'DELETE',
      url: '/api/songs/' + song.id,
    })
    .then(function (res) {
      return res.data;
    });
  };

  var addComment = function (comment, songId) {
    return http({
      method: 'POST',
      url: '/api/songs/' + songId + '/comments/',
      data: comment
    })
    .then(function (res) {
      return res.data;
    });
  };

  var deleteComment = function (tag) {
    return http({
      method: 'DELETE',
      url: '/api/tags/' + tag.id,
    })
    .then(function (res) {
      return res.data;
    });
  };

  return {
    addComment: addComment,
    addSong: addSong,
    deleteComment: deleteComment,
    deleteSong: deleteSong,
    getAllSongs: getAllSongs
  };  
}])

.factory('Groups', ['$http', function (http) {
  var createGroup = function (newGroup) {
    return http({
      method: 'POST',
      url: '/api/groups/',
      data: newGroup
    })
    .then(function (res) {
      return res.data;
    });
  };

  var addUser = function (groupId, userId) {
    var data = {userId: userId, role: 'admin'};
    return http({
      method: 'POST',
      url: '/api/groups/' + groupId + '/users/',
      data: data
    })
    .then(function (res) {
      return res.data;
    });
  };

  var getGroupsByUserId = function (userId) {
    return http({
      method: 'GET',
      url: '/api/users/' + userId + '/groups/'
    })
    .then(function (res) {
      return res.data;
    });
  };

  var getUsersByGroupId = function (groupId) {
    return http({
      method: 'GET',
      url: '/api/groups/' + groupId + '/users/'
    })
    .then(function (res) {
      return res.data;
    });
  };

  var getPlaylistsByGroupId = function (groupId) {
    return http({
      method: 'GET',
      url: '/api/groups/' + groupId + '/playlists/'
    })
    .then(function (res) {
      return res.data;
    });
  };

  var updateInfo = function(group) {
    return http({
      method: 'PUT',
      url: '/api/groups/info',
      data: group
    })
    .then(function(res) {
      return res;
    })
    .catch(console.error);
  };

  // var sendEmailInvite = function (group, email) {
  //   var data = {email: email, groupname: group.name};
    
  //   return http({
  //     method: 'post',
  //     url: '/api/groups/' + group.id + '/einvite',
  //     data: data
  //   })
  //   .then(function (res) {
  //     return res.data;
  //   });
  // };

  var sendInvite = function (group, email) {
    var data = {email: email, group: group};
    
    return http({
      method: 'post',
      url: '/api/groups/' + group.id + '/invite',
      data: data
    })
    .then(function (res) {
      return res.data;
    });
  };

  return {
    createGroup: createGroup,
    addUser: addUser,
    getGroupsByUserId: getGroupsByUserId,
    getUsersByGroupId: getUsersByGroupId,
    getPlaylistsByGroupId: getPlaylistsByGroupId,
    updateInfo: updateInfo,
    sendInvite: sendInvite
  };
}])

.factory('Auth', ['$http', '$location', '$window', '$q', function (http, loc, win, q) {
  // stores users token as com.jam
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
    })
    .then(function(res) {
      userData = res.data.user;
      return res;
    })
    .catch(console.error);
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
