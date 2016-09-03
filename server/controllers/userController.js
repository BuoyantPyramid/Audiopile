var jwt = require('jsonwebtoken');
var config = require('../config/config');
var path = require('path');
var User = require('../models/userModel');

var JWT_SECRET = config.JWT_SECRET || 's00p3R53kritt';

var getGroups = function(req, res, next) {
  var userId = parseInt(req.params.id);

  User.getGroups(userId)
  .then(function (groups) {
    res.json(groups);
  })
  .catch(function (error) {
    next(error);
  });
};

var getProfile = function(req, res, next) {
  var user = req.user;
  User.compileUserData(user)
  .then(function(compiledUser) {
    res.json({
      user: compiledUser
    });
  })
  .catch(function (error) {
    next(error);
  });
};

var getUser = function(req, res, next) {
  var userId = parseInt(req.params.id);
  User.getUser({id: userId})
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

var login = function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  User.getUser({email: email})
  .then(function(user) {
    if (user === null) {
      // user does not exist
      throw new Error('User does not exist!');
      return null;
    } else {
      // save user for use later in promise chain
      this.user = user;
      // check that submitted email is the email returned in db
      if (user.dataValues.email === email) {
        // email returned from db is the exact same as email submitted
        return user.comparePassword(password);
      }
    }
  })
  .then(function(didMatch) {
    // console.log('Password compare response', didMatch);
    if (didMatch) {
      // password is legit
      return User.compileUserData(this.user);
    } else {
      // password is not legit
      throw new Error('Password is not valid!');
      return null;
    }
  })
  .then(function(userData) {
    // console.log('User data=======================!', userData);
    var token = jwt.sign(this.user.toJSON(), JWT_SECRET, { expiresIn: 60 * 60 * 24 });
    res.json({
      token: token,
      user: userData
    });
  })
  .catch(function(err) {
    res.status(401).json(err.message);
  })
  .bind({});


  // .then(function (user) {
  //   this.user = user;
  //   if (!user) {
  //     res.status(404).json('User does not exist');
  //     throw new Error('User does not exist')
  //   } else {
  //     return user.comparePassword(password);
  //   }
  // })
  // .then(function (didMatch) {
  //   if (didMatch) {
  //     return User.compileUserData(this.user);
  //   } else {
  //     res.status(401).json('Incorrect password');
  //     throw new Error('User does not exist');
  //   }
  // })
  // .then(function(compiledUser) {
  //   var token = jwt.sign(this.user.toJSON(), JWT_SECRET, { expiresIn: 60 * 60 * 24 });
  //   res.json({
  //     token: token,
  //     user: compiledUser
  //   });
  // })
  // .catch(function (error) {
  //   next(error);
  // })
  // .bind({});
};

var setAvatar = function(req, res, next) {
  var user = req.user;

  user.update({avatarUrl: req.filename})
  .then(function(user) {
    this.user = user;
    return User.compileUserData(user);
  })
  .then(function(compiledUser) {
    var token = jwt.sign(this.user.toJSON(), JWT_SECRET, { expiresIn: 60 * 60 * 24 });
    res.json({
      user: compiledUser,
      token: token
    });
  })
  .catch(function(error) {
    next(error);
  })
  .bind({});
};

var signup = function (req, res, next) {
  var displayName = req.body.displayName;
  var email = req.body.email;
  var password = req.body.password;

  User.getUser({email: email})
  .then(function(user) {
    if (user) {
      res.status(400).json('User already exists');
    } else {
      return User.createUser(email, displayName, password);
    }
  })
  .then(function (user) {
    this.user = user;
    return User.compileUserData(user);
  })
  .then(function (compiledUser) {
    var token = jwt.sign(this.user.toJSON(), JWT_SECRET, { expiresIn: 60 * 60 * 24 });
    res.json({
      token: token,
      user: compiledUser
    });
  })
  .catch(function (error) {
    next(error);
  })
  .bind({});
};


var updateProfile = function(req, res, next) {
  var user = req.user;
  user.update(req.body)
  .then(function(user) {
    this.user = user;
    return User.compileUserData(user);
  })
  .then(function(compiledUser) {
    var token = jwt.sign(this.user.toJSON(), JWT_SECRET, { expiresIn: 60 * 60 * 24 });
    res.json({
      user: compiledUser,
      token: token
    });
  })
  .catch(function(error) {
    next(error);
  })
  .bind({});
};


module.exports = {
  getUser: getUser,
  getGroups: getGroups,
  getProfile: getProfile,
  login: login,
  setAvatar: setAvatar,
  signup: signup,
  updateProfile: updateProfile
};
