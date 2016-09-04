// var sinon = require('sinon');
// var chai = require('chai');
// var expect = chai.expect;
// var Sequelize = require('sequelize');
// var dbModels = require('../../../server/db/database.js');
// var PlaylistSchema = dbModels.Playlist;
// var Group = dbModels.Group;
// var SongModel = require('../../../server/models/songModel.js');
// var SongController = require('../../../server/controllers/songController.js');
// var GroupController = require('../../../server/controllers/groupController.js');
// var PlaylistController = require('../../../server/controllers/playlistController.js');
// var helpers = require('../testHelpers');

// // Define api request bodies
// var songReq = helpers.songReq;
// var addSongReq = helpers.addSongReq;
// var playlistReq = helpers.playlistReq;

// var compressStub;

// describe('Playlist Controller', function() {
//   before(function(done) {
//     compressStub = sinon.stub(SongModel, 'requestFileCompression', function() {
//       return new Promise(function(resolve, reject) {
//         resolve(true);
//       });
//     });
//     done();
//   });

//   after(function (done) {
//     compressStub.restore();
//     done();
//   });

//   // The `clearDB` helper function, when invoked, will clear the database
//   var clearDB = function(done) {
//     var res = {
//       json: function(playlist) {
//         addSongReq.params.pid = playlist.id;
//         done();
//       }
//     };

//     var addedSongCallback = function(song) {
//       addSongReq.params.sid = song.id;
//       PlaylistController.createPlaylist(playlistReq, res, console.error);
//     };

//     helpers.rebuildDb(function() {
//       Group.create({name: 'Buoyant Pyramid'})
//       .then(function(group) {
//         songReq.params.id = group.id;
//         playlistReq.body.groupId = group.id;
//         SongController.addSong(songReq, {json: addedSongCallback}, console.error);
//       });
//     });

//   };


//   describe('create playlist', function() {
//     // Clear database before each test and then seed it with example `users` so that you can run tests
//     beforeEach(function(done) {
//       clearDB(done);
//     });

//     it('should call res.json to return a json object', function (done) {
//       var res = {};

//       res.json = function(jsonresponse) {
//         expect(jsonresponse).to.have.property('title');
//         done();
//       };

//       res.send = function(err) {
//         console.error(err);
//       };
//       PlaylistController.createPlaylist(playlistReq, res, console.error);
//     });
//   });
//   describe('songs and playlists', function() {
//     it('should add a song to a playlist', function (done) {
//       var res = {};

//       res.json = function(jsonresponse) {
//         expect(jsonresponse.songId).to.equal(addSongReq.params.sid);
//         expect(jsonresponse.playlistId).to.equal(addSongReq.params.pid);
//         done();
//       };

//       res.send = function(err) {
//         console.error(err);
//       };
//       PlaylistController.addSong(addSongReq, res, console.error);
//     });

//     it('should fetch songs from a playlist', function (done) {
//       before(function(done) {
//         dbModels.Playlist.addSong(addSongReq.params.pid, addSongReq.params.sid)
//         .then(function () {
//           done();
//         }).catch(console.error);
//       });

//       var res = {};

//       res.json = function(jsonresponse) {
//         // console.log('jsonresponse is: ' + JSON.stringify(jsonresponse));
//         expect(jsonresponse[0].title).to.eql('Margaritaville');
//         done();
//       };

//       res.send = function(err) {
//         console.error(err);
//       };
//       PlaylistController.getSongs({params: {id: addSongReq.params.pid}}, res, console.error);
//     });
//   });
// });
