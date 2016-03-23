var path = require('path');
var db = require('../db/database');
var config = require('../config/config');
var mailgun = require('mailgun-js')({apiKey: config.mailgun.api_key, domain: config.mailgun.domain});
var Group = db.Group;
var Song = db.Song;
var User = db.User;

var createGroup = function(req, res, next) {
  Group.create({
    name: req.body.name
    // TODO: Add banner
  }).then(function(group) {
    res.json(group);
  })
  .catch(function(err) {
    next(err);
  });
};

var fetchSongs = function(req, res, next) {
  var groupId = req.params.id;
  Group.findOne({where: {id: groupId}})
  .then(function(group) {
    group.getSongs()
    .then(function (songs) {
      res.json(songs);   
    });
  })
  .catch(function(err) {
    next(err);
  });
};

var addUserToGroup = function(req, res, next) {
  // roles:
  //  admin, member, pending
  var groupId = req.params.id;
  var userId = req.body.userId;
  var role = req.body.role;

  User.findOne({})
  addUser(groupId, userId, role, function(user) {
    res.json(user);
  });
};

var addUser = function(groupId, userId, role, cb) {
  return Group.findOne({where: {id: groupId}})
  .then(function(group) {
    User.findOne({where: {id: userId}})
    .then(function(user) {
      group.addUser(user, {role: role});
      cb(user);
    });
  })
  .catch(function(err) {
    return error;
  });
};

var fetchUsers = function(req, res, next) {
  // roles:
  //  admin, member, pending
  var groupId = req.params.id;
  Group.findOne({where: {id: groupId}})
  .then(function(group) {
    group.getUsers()
    .then(function (users) {
      res.json(users);
    });
  })
  .catch(function(err) {
    next(err);
  });
};

var fetchPlaylists = function(req, res, next) {
  var groupId = req.params.id;
  Group.findOne({where: {id: groupId}})
  .then(function(group) {
    group.getPlaylists()
    .then(function (playlists) {
      res.json(playlists);
    });
  })
  .catch(function(err) {
    next(err);
  });
};

var updateGroupInfo = function(req, res, next) {
  Group.update(req.body, {
    where: {
      id: req.body.id
    },
    returning: true
  })
  .then(function(result) {
    res.json(result[1][0]);
  })
  .catch(function(error) {
    next(error);
  });
};

var getBanner = function(req, res, next) {
  var groupId = parseInt(req.params.id);
  Group.findById(groupId)
  .then(function(group) {
    if (group) {
      var url = path.resolve(__dirname + '/../uploadInbox/' + group.bannerUrl);
      res.sendFile(url);
    } else {
      res.status(404).send('group doesn\'t exist');
    }
  })
  .catch(function(error) {
    next(error);
  });
};

// Redirects to either send email invite or add user function
var sendInvite = function(req, res, next) {
  var email = req.body.email;
  var group = req.body.group;
  var groupId = req.params.id;
  User.findOne({where: {email: email}})
  .then(function (user) {
    if (user) {
      addUser(group.id, user.id, 'pending', function(user) {
        res.json(user);
      });
    } else {
      sendEmailInvite(group.name, email, function(value) {
        res.json(value);
      })
    }
  })
};

var sendEmailInvite = function(groupname, email, cb) {
  var data = {
    from: 'Jam Record <jamrecord@samples.mailgun.org>',
    to: email,
    subject: 'Hello',
    text: 'You\'ve been invited to join ' + groupname + ' at JamRecord!\n' +
          'Follow the link below to sign up\n' +
          'Link: http://localhost:3000/#/login/' + email
  };
   
  mailgun.messages().send(data, function (error, body) {
    if (error) {
      cb(error);
    } else {
      cb('Email sent successfully');
    }  
  });
};

module.exports = {
  createGroup: createGroup,
  fetchSongs: fetchSongs,
  fetchPlaylists: fetchPlaylists,
  addUserToGroup: addUserToGroup,
  fetchUsers: fetchUsers,
  updateGroupInfo: updateGroupInfo,
  getBanner: getBanner,
  sendInvite: sendInvite
};
