var path = require('path');
var db = require('../db/database');
var fs = require('fs');
var Song = db.Song;
var Group = db.Group;
var compressionServer = require('./compressionServer.js');
var config = require('../config/config.js');


var addCompressedLink = function(req, res, next) {
  console.log('--- Add Compressed Link ---', req.body);
  var songID = req.body.songID;
  var compressedID = req.body.compressedID;

  Song.find({where: {id: songID}})
    .then(function(song) {
      if (song) {
        song.updateAttributes({
          'compressedAddress': compressedID
        })
      }
    });
}

var addSong = function(req, res, next) {
  // console.log('Receive song data: ', req.body);

  var dateRecorded = req.body.lastModified || null;
  var dateUploaded = Date.now(); //TODO: make a db entry for this data
  var groupId = req.params.id;
  var name = req.body.name || '';
  var description = req.body.description || '';
  var size = req.body.size;
  var awsBucketAddress = req.body.address;
  var uniqueHash = req.body.uniqueHash;
  var duration = req.body.duration || 300;

  console.log('Adding song to DB...');

  Song.create({
    title: name,
    description: description,
    dateRecorded: dateRecorded, // TODO: Receive from UI?
    dateUploaded: dateUploaded, //TODO: ask erick is this in the db schema?
    groupId: groupId,
    size: size, // TODO: ask erick if this size is in db?
    address: awsBucketAddress,
    duration: duration, // TODO: Receive from UI?
    uniqueHash: uniqueHash //TODO: ask erick about this one too..
  }, {
    include: {
      model: Group
    }
  })
  .then(function(song) {
    // Make request to compression server
    //  this call is asychronus
    // If statement prevents calls from compressions server
    // creating a fedback loop
    compressionServer.requestFileCompression(song);

    console.log('requested compression and now tell user confirmed db entry');
    res.json(song);
  })
  .catch(function(err) {
    console.log('Song Db Error!', err);
    res.sendStatus(500);
    // next(err);
  });
};

var getSongByFilename = function(req, res, next) {
  var filename = req.params.filename;
  var url = path.resolve(__dirname + '/../uploadInbox/' + filename);
  res.sendFile(url);
};

var deleteSong = function(req, res, next) {
  // Only deletes from the database. FILES ARE STILL ON S3!
  var songId = req.params.id;
  Song.findById(songId)
  .then(function(song) {
    song.destroy()
    .then(function() {
      res.json(song);
    });
  })
  .catch(function(err) {
    next(err);
  });
};

module.exports = {
  addSong: addSong,
  getSongByFilename: getSongByFilename,
  deleteSong: deleteSong,
  addCompressedLink: addCompressedLink
};
