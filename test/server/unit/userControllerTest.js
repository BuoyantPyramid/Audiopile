var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var mongoose = require('mongoose');
var UserController = require('../../../server/users/userController.js');
var User = require('../../../server/users/userModel.js');

var dbURI = 'mongodb://localhost/testDB';

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function (done) {
  mongoose.connection.collections.users.remove(done);
};

describe('User Controller', function () {

  // Connect to database before any tests
  before(function (done) {
    if (mongoose.connection.db) {
      return done();
    }
    mongoose.connect(dbURI, done);
  });

  // Clear database before each test and then seed it with example `users` so that you can run tests
  beforeEach(function (done) {
    clearDB(function () {
      var users = [
        {
          username: 'nick',
          password: 'nickspassword'
        },
        {
          username: 'sondra',
          password: 'sondraspassword'
        },
        {
          username: 'brian',
          password: 'brianspassword'
        },
        {
          username: 'erick',
          password: 'erickspassword'
        },
      ];

      // See http://mongoosejs.com/docs/models.html for details on the `create` method
      User.create(users, done);
    });
  });
  describe ('sign up', function() {
    it('should respond to valid input with a jwt token in a json object', function (done) {
      var req = {
        body: {
          username: 'jake@ooo.com',
          password: 'thedog'
        }
      };

      var res = {};

      // make my own damn spy
      res.json = function(jsonresponse) {
        expect(jsonresponse).to.have.property('token');
        done();
      };
      // var spy = res.json = sinon.stub();
      UserController.signup(req, res, function() {});
    });

    it('should create a new user in the database', function (done) {
      var req = {
        body: {
          username: 'jake@ooo.com',
          password: 'thedog'
        }
      };

      var res = {};

      res.json = function(jsonresponse) {
        mongoose.connection.collections.users.findOne({username: 'jake@ooo.com'}, function(err, user) {
          expect(user.username).to.equal('jake@ooo.com');
          done();
        });
      };
      UserController.signup(req, res, function() {});
    });

    it('should not allow duplicate email addresses', function (done) {
      var req = {
        body: {
          username: 'jake@ooo.com',
          password: 'thedog'
        }
      };

      var res = {};

      // after one sign up, try to sign up with same email
      res.json = function(jsonresponse) {
        UserController.signup(req, res, function(err) {
          expect(err).to.be.instanceof(Error);
          done();
        });  
      };
      // var spy = res.json = sinon.stub();
      UserController.signup(req, res, function() {});
    });
  });
});