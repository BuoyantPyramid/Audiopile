var db = require('../db/database');
var Song = db.Song;
var Comment = db.Comment;
var request = require('request');
var Promise = require('bluebird');
var awsConfig = require('../config/aws.config.js');
var config = require('../config/config.js');

var addSong = function (songData) {
  return Song.create(songData);
};

var addCompressedLink = function(songID, compressedID, amplitudeData) {
  console.log('--- --- Add compressed link Song.find() update DB', songID, compressedID);
  return new Promise(function(resolve, reject) {
    Song.find({where: {id: songID}})
    .then(function(song) {
      if (song) {
        song.updateAttributes({
          'compressedAddress': 'https://' + awsConfig.bucket + '.s3.amazonaws.com/audio/' + compressedID,
          'amplitudeData': amplitudeData
        });
        resolve();
      }
    })
    .catch(function(err) {
      reject(err);
    });  
  });
};

var getComments = function(songId) {
  return new Promise(function (resolve, reject) {
    Song.findById(songId)
    .then(function(song) {
      if (song) {
        resolve(song.getComments());
      } else {
        resolve([]);
      }
    });
  });
};

var getSong = function(songId) {
  return Song.findById(songId);
};

// TODO: why is this a promise?
var requestFileCompression = function(song) {
  // console.log('--- 2 --- Request file compression Promise');
  return new Promise(function (resolve, reject) {
    request.post(
      config.COMPRESSION_SERVER + '/compress',
      {
        json: {
          songID: song.id,
          s3UniqueHash: song.uniqueHash
        }
      },
      function (error, response, body) {
        if (error) {
          console.log('--- 2.5 --- Request compression error: ', error);
          reject(error);
        } else if (!error && response.statusCode === 200) {
          console.log(' --- 2.6 --- Successful request to compression server: ', body);
          resolve(true);
        }
      }
    );
  });
};

module.exports = {
  addCompressedLink: addCompressedLink,
  addSong: addSong,
  getComments: getComments,
  getSong: getSong,
  requestFileCompression: requestFileCompression
};