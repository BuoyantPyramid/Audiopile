var expect = require('chai').expect;
var Sequelize = require('sequelize');
var dbModels = require('../../../server/db/database.js');
var Song = dbModels.Song; 
var User = dbModels.User; 
var Group = dbModels.Group; 
var Playlist = dbModels.Playlist; 
var UserGroups = dbModels.UserGroups; 
dbModels.db.options.logging = false;


// rebuild test database
before(function (done) {
  User.sync({force: true})
  .then(function() {
    return Group.sync({force: true});
  })
  .then(function() {
    return Playlist.sync({force: true});
  })
  .then(function() {
    return Song.sync({force: true});
  })
  .then(function() {
    return UserGroups.sync({force: true});
  })
  .then(function() {
    done();
  });
});

describe('User Model', function () {
  it('User should be a Sequelize model', function () {
    expect(User).to.be.instanceOf(Sequelize.Model);
  });
  
  it('should have a schema with fields: id, email, displayName, password', function (done) {
    User.describe().then(function(schema) {
      expect(schema.id).to.exist;
      expect(schema.email).to.exist;
      expect(schema.displayName).to.exist;
      expect(schema.password).to.exist;
      done();
    });
  });
});

describe('Group Model', function () {
  it('should be a Sequelize model', function () {
    expect(Group).to.be.instanceOf(Sequelize.Model);
  });
  
  it('should have a schema with fields: name, bannerUrl', function (done) {
    Group.describe().then(function(schema) {
      expect(schema).to.include.keys('name', 'bannerUrl');
      done();
    });
  });
});

describe('Song Model', function () {
  it('should be a Sequelize model', function () {
    expect(Song).to.be.instanceOf(Sequelize.Model);
  });
  
  it('should have a schema with fields: title, description, dateRecorded, duration, groupId', function (done) {
    Song.describe().then(function(schema) {
      expect(schema).to.include.keys('title', 'description', 'dateRecorded', 'duration', 'groupId');
      done();
    });
  });
});
