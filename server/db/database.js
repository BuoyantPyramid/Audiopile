var config = require('../config/config.js'); 
var pg = require('pg');
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var sqldebug = process.env.SQL_DEBUG || false;

console.log('====================================================');
console.log('Process env JAMRUN')
console.log(process.env.JAMRUN);
console.log('COnnection string');
console.log(config.connectionString);
console.log('=====================================================')

var db = new Sequelize(config.connectionString, {logging: sqldebug});

// var makeNewSequelize = function() {
//   return new Sequelize(config.connectionString, {logging: sqldebug})
// };

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
    defaultValue: 'http://www.murketing.com/journal/wp-content/uploads/2009/04/vimeo.jpg' // Change to random default on signup
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
    defaultValue: '' // Update
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
    allowNull: true
  },
  dateUploaded: {
    type: Sequelize.DATE,
    allowNull: true
  },
  size: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  uniqueHash: {
    type: Sequelize.STRING,
    allowNull: false
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'http://www.stephaniequinn.com/Music/Canon.mp3'
  },
  compressedAddress: {
    type: Sequelize.STRING,
    allowNull: true
  },
  imageUrl: {
    type: Sequelize.STRING,
    defaultValue: 'http://lorempixel.com/200/200/' // Update
  },
  amplitudeData: {
    type: Sequelize.JSON,
    allowNull: true
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

var Comment = db.define('comment', {
  time: {
    type: Sequelize.INTEGER
  },
  note: {
    type: Sequelize.STRING
  }
});

// Define join tables
var UserGroups = db.define('userGroups', {
  role: {
    type: Sequelize.STRING,
  }}, 
  {timestamps: false}
);

var PlaylistSongs = db.define('playlistSongs', {
  listPosition: {
    type: Sequelize.INTEGER,
  }}
);

// Define associations
Group.belongsToMany(User, {through: 'userGroups'});
User.belongsToMany(Group, {through: 'userGroups'});

User.belongsToMany(Group, {
  through: {
    model: UserGroups,
    scope: {
      role: 'admin'
    }
  },
  as: 'adminGroups'
});

User.belongsToMany(Group, {
  through: {
    model: UserGroups,
    scope: {
      role: 'member'
    }
  },
  as: 'memberGroups'
});

User.belongsToMany(Group, {
  through: {
    model: UserGroups,
    scope: {
      role: 'pending'
    }
  },
  as: 'pendingGroups'
});

Group.belongsToMany(User, {
  through: {
    model: UserGroups,
    scope: {
      role: 'admin'
    }
  },
  as: 'adminUsers'
});

Group.belongsToMany(User, {
  through: {
    model: UserGroups,
    scope: {
      role: 'member'
    }
  },
  as: 'memberUsers'
});

Group.belongsToMany(User, {
  through: {
    model: UserGroups,
    scope: {
      role: 'pending'
    }
  },
  as: 'pendingUsers'
});

Group.hasMany(Song, {onDelete: 'cascade'});
Song.belongsTo(Group);

Group.hasMany(Playlist, {onDelete: 'cascade'});
Playlist.belongsTo(Group);

Playlist.belongsToMany(Song, {through: 'playlistSongs'});
Song.belongsToMany(Playlist, {through: 'playlistSongs'});

User.hasMany(Comment, {onDelete: 'cascade'});
Comment.belongsTo(User);

Song.hasMany(Comment, {onDelete: 'cascade'});
Comment.belongsTo(Song);


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
  })
  .then(function() {
    return PlaylistSongs.sync();
  })
  .then(function() {
    return Comment.sync();
  });

module.exports = {
  db: db, // this will cause problems in the entire app if commented out. Sequalize will not work anywhere!
  User: User,
  Group: Group,
  UserGroups: UserGroups,
  Song: Song,
  Playlist: Playlist,
  PlaylistSongs: PlaylistSongs,
  Comment: Comment,
  // makeNewSequelize: makeNewSequelize
};

// Command to drop all tables in postgres
// drop table users cascade; drop table groups cascade; drop table users; drop table groups; drop table "userGroups"; drop table playlists; drop table songs cascade; drop table "playlistSongs"; drop table comments; drop table playlists;
