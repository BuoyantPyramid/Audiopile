var path = require('path');
var fs = require('fs');
var SongModel = require('../models/songModel');
var awsConfig = require('../config/aws.config.js');
var Promise = require('bluebird');

var AWS = require('aws-sdk');
AWS.config.update({
  'accessKeyId': awsConfig.accessKeyId,
  'secretAccessKey': awsConfig.secretAccessKey,
  'region': awsConfig.region
});
var s3 = new AWS.S3();
var bucketAddress = s3.endpoint.protocol + '//' + awsConfig.bucket + '.' + s3.endpoint.hostname + s3.endpoint.pathname;

var addCompressedLink = function (req, res, next) {
  console.log('--- Add Compressed Link ---', req.body);
  var songID = req.body.songID;
  var compressedID = req.body.compressedID;
  var amplitudeData = req.body.amplitudeData;

  SongModel.addCompressedLink(songID, compressedID, amplitudeData)
  .then(function(data) {
    console.log('Did it!');
    res.sendStatus(200);
  })
  .catch(function(err) {
    console.log('Fail!');
    res.sendStatus(500);
    // TODO: figure out the correct code here!
  });

};

var addSong = function (req, res, next) {
  var song = {};
  song.title = req.body.name || '';
  song.description = req.body.description || '';
  song.dateRecorded = req.body.lastModified || null;
  song.dateUploaded = Date.now(); //TODO: make a db entry for this data
  song.groupId = req.params.id;
  song.size = req.body.size;
  song.address = req.body.address;
  song.uniqueHash = req.body.uniqueHash;
  song.duration = req.body.duration || 300;

  SongModel.addSong(song)
  .then(function(song) {
    SongModel.requestFileCompression(song)
    .then(function(bool) {
      res.json(song);
    });
  })
  .catch(function(err) {
    next(err);
  });
};

var s3delete = function (song) {
  // delete both original and compressed files from aws
  var params = {
    Bucket: awsConfig.bucket, /* required */
    Delete: { /* required */
      Objects: [ /* required */
        {
          Key: song.address.replace(bucketAddress, ''), /* required */
        },
        {
          Key: song.compressedAddress.replace(bucketAddress, ''), /* required */
        }
      ],
    },
  };
  return new Promise(function (resolve, reject) {
    s3.deleteObjects(params, function(err, res) {
      if (err) {
        reject(error);
      } else {
        resolve(res);
      }
    });
  });
};

var deleteSong = function (req, res, next) {
  var songId = req.params.id;

  SongModel.getSong(songId)
  .then(function(song) {
    s3delete(song)
    .then(function(s3response) {
      console.log('s3 delete response is ' + JSON.stringify(s3response));
      song.destroy()
      .then(function() {
        res.json(song);
      });
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).json('error deleting song from aws: ' + err);
    });
  })
  .catch(function(err) {
    next(err);
  });
};

var getComments = function (req, res, next) {
  var songId = req.params.id;
  SongModel.getComments(songId)
  .then(function (comments) {
    res.json(comments);
  })
  .catch(function (error) {
    res.status(500).json('error retreiving comments');
  })
};

var getSong = function (req, res, next) {
  var songId = req.params.id;
  SongModel.getSong(songId)
  .then(function (song) {
    res.json(song);
  })
  .catch(function (error) {
    res.status(500).json('error retreiving song');
  })
};

module.exports = {
  addCompressedLink: addCompressedLink,
  addSong: addSong,
  deleteSong: deleteSong,
  getComments: getComments,
  getSong: getSong
};
