// var request = require('supertest');
// var express = require('express');
// var app = require('../../../server/server.js');
// var chai = require('chai');
// var expect = chai.expect;
// var Sequelize = require('sequelize');
// var dbModels = require('../../../server/db/database.js');
// var Song = dbModels.Song; 
// var User = dbModels.User; 
// var Group = dbModels.Group; 
// var Playlist = dbModels.Playlist; 
// var UserGroups = dbModels.UserGroups; 
// var UserController = require('../../../server/controllers/userController.js');
// var helpers = require('../testHelpers');

// var dbUser, jwtToken;

// // Initialize db with one user before every test
// var clearDB = function(done) {
//   var req = {
//     body: {
//       email: 'finn@ooo.com',
//       displayName: 'Finn',
//       password: 'thehoomun'
//     }
//   };

//   var res = {
//     json: function(response) {
//       dbUser = response.user;
//       jwtToken = response.token;
//       done();
//     }
//   };
//   dbModels.db.query('DELETE from USERS where true')
//   .spread(function(results, metadata) {
//     UserController.signup(req, res, console.error);
//   });
// };


// describe('API', function() {
//   // rebuild test database
  
//   before(function (done) {
//     helpers.rebuildDb(done);
//   });


//   beforeEach(function(done) {
//     clearDB(function() {
//       done();
//     });
//   });

//   describe('user', function() {
//     it('should be able to sign up a new user with a valid email and password', function(done) {
//       request(app)
//       .post('/api/users/signup')
//       .send({
//         'email': 'jake@ooo.com',
//         'displayName': 'Jake',
//         'password': 'thedog'
//       })
//       .expect(200)
//       .expect(function(res) {
//         expect(res.body.token).to.exist;
//         expect(res.body.user).to.exist;
//         expect(res.body.user.currentGroup).to.exist;
//         expect(res.body.user.currentGroup.songs).to.exist;
//       })
//       .end(done);
//     });
    
//     it('should not accept an invalid email on signup', function(done) {
//       request(app)
//       .post('/api/users/signup')
//       .send({
//         'email': 'jake',
//         'displayName': 'Jake',
//         'password': 'thedog'
//       })
//       .expect(400)
//       .end(done);
//     });

//     it('should login an existing user', function(done) {
//       request(app)
//       .post('/api/users/login')
//       .send({
//         email: 'finn@ooo.com',
//         password: 'thehoomun'
//       })
//       .expect(200)
//       .expect(function(res) {
//         expect(res.body.token).to.exist;
//         expect(res.body.user).to.exist;
//         expect(res.body.user.currentGroup).to.exist;
//         expect(res.body.user.currentGroup.songs).to.exist;
//       })
//       .end(done);
//     });

//     it('should send a 404 status when logging in a nonexistent user', function(done) {
//       request(app)
//       .post('/api/users/login')
//       .send({
//         email: 'jake@ooo.com',
//         password: 'thedog'
//       })
//       .expect(404)
//       .end(done);
//     });

//     it('should send a 401 status when logging in with an incorrect password', function(done) {
//       request(app)
//       .post('/api/users/login')
//       .send({
//         email: 'finn@ooo.com',
//         password: 'wrongpassword'
//       })
//       .expect(401)
//       .end(done);
//     });

//   });

//   xdescribe('profile', function() {
//     it('should be able to fetch own profile', function(done) {
//     });
    
//     it('should throw a 401 with no jwt in header', function(done) {
//     });

//     it('should throw a 401 with a nonsense token', function(done) {

//     });

//     it('should be able to update own profile', function(done) {
//     });
//   });
// });
