var helpers = require('./helpers.js');
var Song = require('../controllers/songController');
var Group = require('../controllers/groupController');
var Playlist = require('../controllers/playlistController');
var User = require('../controllers/userController');
var Upload = require('../controllers/upload');
var Comment = require('../controllers/commentController');

var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);  //pass a http.Server instance

var routing = function (app, express) {

  var apiRoutes = express.Router(); 

  // apiRoutes.get('/songs/:filename', Song.getSongByFilename);

  apiRoutes.post('/users/signup', User.signup);
  apiRoutes.post('/users/login', User.login);
  // apiRoutes.get('/users/:id/avatar', User.getAvatar);
  // apiRoutes.get('/groups/:id/banner/', Group.getBanner);
  
  // secret unprotected routes from compression server
  // TODO: make this secret an actual secret
  apiRoutes.post('/addCompressedLink/secret', Song.addCompressedLink);

  // EVERYTHING BELOW THIS WILL NEED A JWT TOKEN!!!
  apiRoutes.use(helpers.verifyToken);

  // Song related requests
  apiRoutes.delete('/songs/:id', Song.deleteSong);
  apiRoutes.get('/songs/:id', Song.getSong);
  apiRoutes.put('/songs/:id', Song.updateSong);

  apiRoutes.post('/songs/:id/comments', Comment.addComment);
  apiRoutes.get('/songs/:id/comments', Song.getComments);

  // User related requests
  apiRoutes.post('/users/avatar', Upload.catchUpload, User.setAvatar);
  apiRoutes.put('/users/profile', User.updateProfile);
  apiRoutes.get('/users/profile', User.getProfile);
  apiRoutes.get('/users/:id', User.getUser);
  apiRoutes.get('/users/:id/groups', User.getGroups);

 
  // Add, update and retrieve groups
  apiRoutes.put('/groups/info', Group.updateGroupInfo);
  apiRoutes.put('/groups/:gid/users/:uid', Group.updateUserRole);
  apiRoutes.post('/groups/', Group.createGroup);
  apiRoutes.post('/groups/:id/users/', Group.addUser);
  // apiRoutes.get('/groups/:id/users/', Group.getUsers);
  apiRoutes.get('/groups/:id/playlists/', Group.getPlaylists);
  apiRoutes.delete('/groups/:gid/users/:uid', Group.removeUser);
  apiRoutes.delete('/groups/:id', Group.deleteGroup);

  // Add and retrieve songs
  apiRoutes.post('/groups/:id/songs/', Song.addSong);
  apiRoutes.get('/groups/:id/songs/', Group.getSongs);

  // Remove song comments
  apiRoutes.delete('/comments/:id', Comment.deleteComment);

  // Add and retrieve playlists
  apiRoutes.post('/playlists/', Playlist.createPlaylist);
  apiRoutes.post('/playlists/:sid/:pid/', Playlist.addSong);
  apiRoutes.get('/playlists/:id/', Playlist.getSongs);
  apiRoutes.put('/playlists/:id', Playlist.updatePositions);
  apiRoutes.delete('/playlists/:sid/:pid', Playlist.removeSong);
  apiRoutes.delete('/playlists/:id/', Playlist.deletePlaylist);

  // Upload handling
  apiRoutes.post('/s3/', Upload.getS3Data);
  apiRoutes.post('/upload/', Upload.catchUpload);



  // Send email invites
  apiRoutes.post('/groups/:id/invite', Group.sendInvite);

  // Handle error logging of requests that are destined for above routes
  apiRoutes.use(helpers.errorLogger);
  apiRoutes.use(helpers.errorHandler);


  app.use('/api', apiRoutes);
};

module.exports = routing;
