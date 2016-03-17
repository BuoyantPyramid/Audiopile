var config = require('../config/config.js'); 
var pg = require('pg');
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


var connectionString = (process.env.NODE_ENV === 'test') ? config.testConnectionString : config.connectionString;
var sqldebug = process.env.SQL_DEBUG || false;
var db = new Sequelize(connectionString, {logging: sqldebug});

// Define table schemas
var User = db.define('user', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {isEmail: {msg: 'Invalid email'}}
  },
  displayName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  avatarURL: {
    type: Sequelize.STRING,
    defaultValue: '' // Complete
  },
  currentGroupId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  classMethods: {
    hashPassword: function(password) {
      var hashAsync = Promise.promisify(bcrypt.hash);
      return hashAsync(password, null, null).bind(this);
    } 
  },
  instanceMethods: {
    comparePassword: function(attemptedPassword) {
      var compareAsync = Promise.promisify(bcrypt.compare);
      return compareAsync(attemptedPassword, this.password);
    } 
  },
  hooks: {
    beforeCreate: function(user, options) {
      return this.hashPassword(user.password)
        .then(function(hash) {
          user.password = hash;
        });
    },
  }
});

var Group = db.define('group', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  bannerUrl: {
    type: Sequelize.STRING,
    defaultValue: 'http://imgur.com/gallery/QI8f5gx' // Update
  }
});

var Song = db.define('song', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  dateRecorded: {
    type: Sequelize.DATE,
    allowNull: false
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'http://imgur.com/gallery/QI8f5gx' // Update
  },
  imageUrl: {
    type: Sequelize.STRING,
    defaultValue: 'http://imgur.com/gallery/QI8f5gx' // Update
  }
});

var Playlist = db.define('playlist', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
  }
});

// Define join tables
var UserGroups = db.define('userGroups', {
  role: {
    type: Sequelize.STRING,
  }}, 
  {timestamps: false}
);

// Define associations
Group.belongsToMany(User, {through: 'userGroups'});
User.belongsToMany(Group, {through: 'userGroups'});

Group.hasMany(Song);
Song.belongsTo(Group);

Group.hasMany(Playlist);
Playlist.belongsTo(Group);

Playlist.hasMany(Song);
Song.belongsTo(Playlist);

var logSync = false; //(process.env.NODE_ENV === 'test') ? false : console.log;

// Sync models to define postgres tables and capture associations
User.sync()
  .then(function() {
    return Group.sync();
  })
  .then(function() {
    return Playlist.sync();
  })
  .then(function() {
    return Song.sync();
  })
  .then(function() {
    return UserGroups.sync();
  });

module.exports = {
  db: db,
  User: User,
  Group: Group,
  UserGroups: UserGroups,
  Song: Song,
  Playlist: Playlist
};

// Command to drop all tables in postgres
// drop table users cascade; drop table groups cascade; drop table users; drop table groups; drop table "userGroups"; drop table playlists; drop table songs;
