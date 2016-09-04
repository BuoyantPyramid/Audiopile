var dbModels = require('../../server/db/database.js');
var Song = dbModels.Song; 
var User = dbModels.User; 
var Group = dbModels.Group; 
var Playlist = dbModels.Playlist;
var PlaylistSongs = dbModels.PlaylistSongs;
var UserGroups = dbModels.UserGroups; 


dbModels.db.options.logging = false;

// rebuild test database
var rebuildDb = function (done) {
  User.sync()
  .then(function () {
    return Group.sync();
  })
  .then(function() {
    return UserGroups.sync();
  })
  .then(function() {
    return Playlist.sync();
  })
  .then(function() {
    return Song.sync();
  })
  .then(function() {
    return PlaylistSongs.sync();
  })
  .then(function () {
    return User.destroy({where: {}});
  })
  .then(function() {
    return Group.destroy({where: {}});
  })
  .then(function () {
    return UserGroups.destroy({where: {}});
  })
  .then(function () {
    return Playlist.destroy({where: {}});
  })
  .then(function () {
    return Song.destroy({where: {}});
  })
  .then(function () {
    return PlaylistSongs.destroy({where: {}});
  })
  .then(function() {
    console.log('============== REBUILD DB DOES RUN! ======================')
    done();
  });
};

// // Define api request bodies
// var songReq = {
//   body: {
//     name: 'Margaritaville',
//     description: 'Wasted again',
//     uniqueHash: 'asdfbbrkdjgf.wav',
//     address: ' https://jamrecordtest.s3.amazonaws.com/audio/88408bec-a2b3-464a-9108-a3284da79f65.mp3',
//     size: 9238148
//   },
//   params: {
//     id: 1
//   },
// };

// var groupReq = {
//   body: {
//     name: 'Safety Talk'
//   }
// };

// var addSongReq = {
//   params: {
//     sid: 1,
//     pid: 1
//   }
// };

// var playlistReq = {
//   body: {
//     title: 'Chill Vibes',
//     description: 'Indie Electronic',
//     groupId: 1
//   }
// };




module.exports = {
  rebuildDb: rebuildDb,
//   songReq: songReq,
//   groupReq: groupReq, 
//   addSongReq: addSongReq,
//   playlistReq: playlistReq
};