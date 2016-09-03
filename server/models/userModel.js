var db = require('../db/database');
var Group = db.Group;
var UserGroups = db.UserGroups;
var Song = db.Song;
var User = db.User;
var Promise = require('bluebird');

var sanitizeUser = function (user) {
  var sanitizedUser = user.toJSON();
  delete sanitizedUser.password;
  return sanitizedUser;
};

var compileUserData = function(user) {
  return Group.findById(user.currentGroupId, {include: [{model: Song}]})
  .then(function(currentGroup) {
    // Get rid of the password;
    currentGroup = currentGroup.toJSON();
    user = sanitizeUser(user);
    user.currentGroup = currentGroup;
    return user;
  });
};

var createUser = function (email, displayName, password) {
  return new Promise(function (resolve, reject) {
    Group.create({
      name: displayName,
    })
    .then(function (group) {
      this.group = group;
      return User.create({
        displayName: displayName,
        email: email,
        password: password,
        currentGroupId: group.id
      });
    })
    .then(function (user) {
      this.user = user;
      return this.group.addUser(user, {role: 'admin'});
    })
    .then(function () {
      resolve(this.user);
    })
    .catch(function (error) {
      reject(error);
    });
  }).bind({});
};

var getGroups = function(userId) {
  return User.findById(userId, {
    include: [{
      model: Group,
      include: [{
        model: User,
        attributes: { exclude: ['password'] }
      }]
    }]
  })
  .then(function(user) {
    return user.groups;
  });
};

var getUser = function (query) {
  return User.findOne({where: query});
};

module.exports = {
  compileUserData: compileUserData,
  createUser: createUser,
  getGroups: getGroups,
  getUser: getUser,
  sanitizeUser: sanitizeUser
};
