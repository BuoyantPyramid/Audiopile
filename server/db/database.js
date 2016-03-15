var config = require('../config/config.js'); 
var Sequelize = require('sequelize');

// Define table schemas
var User = config.db.define('user', {
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
  salt: Sequelize.STRING,
  avatarURL: {
    type: Sequelize.STRING,
    defaultValue: '' // Complete
  }
});

var Group = config.db.define('group', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  bannerUrl: {
    type: Sequelize.STRING,
    defaultValue: 'http://imgur.com/gallery/QI8f5gx' // Update
  }
});

var Song = config.db.define('song', {
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

var Playlist = config.db.define('playlist', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
  }
});

// Define join tables
var UserGroups = config.db.define('userGroups', {
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
  User: User,
  Group: Group,
  Song: Song,
  Playlist: Playlist
};

// Command to drop all tables in postgres
// drop table users cascade; drop table groups cascade; drop table users; drop table groups; drop table "userGroups"; drop table playlists; drop table songs;
