var config = require('../../../server/config/config');
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var sinon = require('sinon');
var Sequelize = require('sequelize');
var db = require('../../../server/db/database');
var testHelpers = require('../testHelpers.js');

var UserModel = require('../../../server/models/userModel');
var GroupModel = require('../../../server/models/groupModel');

describe('Clear DB: ', function() {
  this.timeout(15000);

  before(function(done) {
    // double check that you are not reseting the production database!
    // This may not work on the server, remove second conditional if that is the case
    if (process.env.JAMRUN === 'test') {
      testHelpers.rebuildDb(function() {
        console.log('--- --- --- clear db first time');

        done();
      });
    }
  });

  it('there should be no Users', function(done) {
    db.User.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
      done()
    });
  });
  it('there should be no Groups', function(done) {
    db.Group.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
      done()
    });
  });
  it('there should be no Songs', function(done) {
    db.Song.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
      done()
    });
  });
  it('there should be no Playlists', function(done) {
    db.Playlist.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
      done()
    });
  });
  it('there should be no Comments', function(done) {
    db.Comment.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
      done()
    });
  });
  it('there should be no UserGroups', function(done) {
    db.UserGroups.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
      done()
    });
  });
  it('there should be no PlaylistSongs', function(done) {
    db.PlaylistSongs.findAll()
    .then(function(res) {
      expect(res.length).to.equal(0);
      done()
    });
  });
});

describe('Adding Users: ', function() {
  this.timeout(15000);

  console.log('============================= ADDING USERS ==============================')

  before(function(done) {
    console.log('=== 1 === BEFORE REBUILD DB');
    // double check that you are not reseting the production database!
    // This may not work on the server, remove second conditional if that is the case
    if (process.env.JAMRUN === 'test') {
      console.log('=== 2 === BEFORE REBUILD DB');

      testHelpers.rebuildDb(function() {
        console.log('=== 2.5 === BEFORE REBUILD DB');

        done();
      });
    }
  });

  var currentGroupId = undefined;
  it('should add one user', function(done) {
    console.log('=== 3 ===');

    UserModel.createUser('test@gmail.com', 'testUser1', 'testpassword')
    .then(function(res) {
      currentGroupId = res.dataValues.currentGroupId;
      expect(res.displayName).to.equal('testUser1');
      done();
    });
  });
  it('User should be a Sequelize model', function (done) {
    console.log('=== 4 ===');
    expect(db.User).to.be.instanceOf(Sequelize.Model);
    done()
  });
  it('should have a schema with fields: id, email, displayName, password', function (done) {
    console.log('=== 5 ===');
    db.User.describe().then(function(schema) {
      expect(schema.id).to.exist;
      expect(schema.email).to.exist;
      expect(schema.displayName).to.exist;
      expect(schema.password).to.exist;
      done();
    });
  });
  it('should not allow multiple users with the same email', function(done) {
    console.log('=== 6 ===');

    UserModel.createUser('test@gmail.com', 'testUser2', 'testpassword2')
    .then(function(res) {
      done();
    })
    .catch(function(err) {
      console.log('=== 6.5 ===');

      expect(err.message).to.equal('Validation error')
      done();
    });
  });
  it('user should have group with own name', function(done) {
    console.log('=== 7s ===');

    GroupModel.getGroup(currentGroupId)
    .then(function(res) {
      expect(res.dataValues.name).to.equal('testUser1');
      done();
    });
  });
});

