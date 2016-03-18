var db = require('../db/database');
var jwt = require('jwt-simple');
var config = require('../config/config');
var path = require('path');

var User = db.User;
var Group = db.Group;
var Song = db.Song;

var JWT_SECRET = config.JWT_SECRET || 's00p3R53kritt';

var _compileUserData = function(user) {
  return Group.findById(user.currentGroupId, {include: [{model: Song}]})
  .then(function(currentGroup) {

    // FUCK THIS HACK
    user = JSON.parse(JSON.stringify(user));
    delete user.password;
    user.currentGroup = currentGroup;
    return user;
  });
};

var signup = function (req, res, next) {
  var displayName = req.body.displayName;
  var email = req.body.email;
  var password = req.body.password;

  User.findOne({where: {email: email}})
    .then(function (existingUser) {
      if (existingUser) {
        res.status(400).json('User already exists!');
      } else {
        return Group.create({
          name: req.body.displayName,
        });
      }
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
        .then(function() {
          var token = jwt.encode(user, JWT_SECRET);
          _compileUserData(user).then(function(compiledUser) {
            res.json({
              token: token,
              user: compiledUser
            });
          });
        });
      })
      .catch(function(err) {
        res.status(400).json(err);
      });
    }) 
    .catch(function (error) {
      next(error);
    });
};



var login = function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  User.findOne({where: {email: email}})
    .then(function (user) {
      if (!user) {
        res.status(404).json('User does not exist');
      } else {
        return user.comparePassword(password)
          .then(function (didMatch) {
            if (didMatch) {
              var token = jwt.encode(user, JWT_SECRET);
              _compileUserData(user)
              .then(function(compiledUser) {
                res.json({
                  token: token,
                  user: compiledUser
                });
              });
            } else {
              res.status(401).json('Incorrect password');
            }
          });
      }
    })
    .catch(function (error) {
      next(error);
    });
};

var getProfile = function(req, res, next) {
  var user = req.user;
  _compileUserData(user)
  .then(function(compiledUser) {
    res.json({
      user: compiledUser
    });
  });
};

var updateProfile = function(req, res, next) {
  var user = req.user;
  user.update(req.body)
  .then(function(user) {
    var token = jwt.encode(user, JWT_SECRET);
    _compileUserData(user)
    .then(function(compiledUser) {
      res.json({
        user: compiledUser,
        token: token
      });
    });
  })
  .catch(function(error) {
    next(error);
  });
};


var getUser = function(req, res, next) {
  var userId = parseInt(req.params.id);
  User.findById(userId)
  .then(function(foundUser) {
    if (foundUser) {
    // INCLUDE GROUPS TOO???
      res.json({
        user: {
          id: foundUser.id,
          displayName: foundUser.displayName,
          avatarUrl: foundUser.avatarUrl
        }
      });
    } else {
      res.status(404).json('user doesn\'t exist');
    } 
  })
  .catch(function(error) {
    next(error);
  });
};

var getAvatar = function(req, res, next) {
  console.log('in getAvatar');
  var userId = parseInt(req.params.id);
  User.findById(userId)
  .then(function(foundUser) {
    if (foundUser) {
      var url = path.resolve(__dirname + '/../uploadInbox/' + foundUser.avatarURL);
      res.sendFile(url);
    } else {
      res.status(404).send('user doesn\'t exist');
    } 
  })
  .catch(function(error) {
    next(error);
  });
};

module.exports = {
  signup: signup,
  login: login,
  getUser: getUser,
  updateProfile: updateProfile,
  getProfile: getProfile,
  getAvatar: getAvatar
};
