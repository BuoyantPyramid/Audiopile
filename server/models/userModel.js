var db = require('../db/database');
var User = db.User;
var Group = db.Group;

var createUser = function (email, displayName, password) {
  return new Promise(function (resolve, reject) {
    Group.create({
      name: displayName,
    })
    .then(function (group) {
      User.create({
        displayName: displayName,
        email: email,
        password: password,
        currentGroupId: group.id
      })
      .then(function (user) {
        group.addUser(user, {role: 'admin'})
          .then(function () {
            resolve(user);
          });
        });
      })
      .catch(function (error) {
        reject(error);
      });
    });
};

var getUserByEmail = function (email) {
  return User.findOne({where: {email: email}});
};

module.exports = {
  createUser: createUser,
  getUserByEmail: getUserByEmail
}
