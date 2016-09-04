// var sinon = require('sinon');
// var chai = require('chai');
// var expect = chai.expect;
// var Promise = require('bluebird');
// var Sequelize = require('sequelize');
// var dbModels = require('../../../server/db/database.js');
// var helpers = require('../testHelpers');
// var Song = dbModels.Song; 
// var Group = dbModels.Group; 
// var GroupController = require('../../../server/controllers/groupController.js');
// var SongModel = require('../../../server/models/songModel.js');
// var SongController = require('../../../server/controllers/songController.js');



// var songReq = helpers.songReq;
// var groupReq = helpers.groupReq;

// var compressStub;

// describe('Song Controller', function () {


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


//   // Connect to database before any tests
//   beforeEach(function (done) {
//     helpers.rebuildDb(function() {
//       Group.create({name: 'Safety Talk'})
//       .then(function(group) {
//         songReq.params.id = group.id;
//         done();
//       });
//     });
//   });

//   describe ('add song', function() {

//     it('should call res.json to return a json object', function (done) {
//       var res = {};
//       res.json = function(jsonresponse) {
//         expect(jsonresponse).to.have.property('title');
//         done();
//       };

//       res.send = function(err) {
//         console.error(err);
//       };
//       SongController.addSong(songReq, res, console.error);
//     });


//     it('should create a new song in the database', function (done) {
//       var res = {};
//       res.send = function(err) {
//         console.error(err);
//       };
//       res.json = function(jsonresponse) {
//         dbModels.db.query('SELECT * FROM songs WHERE title = :title ', { replacements: {title: songReq.body.name}, type: Sequelize.QueryTypes.SELECT})
//         .then( function(songs) {
//           expect(songs[0].title).to.equal(songReq.body.name);
//           done();
//         });
//       };
//       SongController.addSong(songReq, res, function() {});
//     });
//   });
// });