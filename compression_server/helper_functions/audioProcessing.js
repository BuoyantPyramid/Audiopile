var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var queue = require('queue');
var request = require('request');
var ffmpeg = require('fluent-ffmpeg');
var serverConfig = require('../config/server.config.js');
var awsConfig = require('../config/aws.config.js');

var AWS = require('aws-sdk');
AWS.config.update({
  "accessKeyId": awsConfig.accessKeyId,
  "secretAccessKey": awsConfig.secretAccessKey,
  "region": awsConfig.region
});
var s3 = new AWS.S3();

var downloadQueue = queue();
// downloadQueue.timeout = 100000;
downloadQueue.concurrency = 5;
// TODO: what if something timesout?
// downloadQueue.on('timeout', function(next, job) {
//   console.log('job timed out:', job.toString().replace(/\n/g, ''));
//   next();
// });
downloadQueue.on('success', function(result, job) {
  console.log('--- 3.5 --- Success finished processing:');
});
downloadQueue.on('end', function(data) {
  console.log('--- 4 --- Queue completed! Queue status: ', downloadQueue.running);
});



var primaryServerStatusUpdate = function() {
  // notify main server of add to queue
  // request.post('http://localhost:5000/api/trancodingStatus',
  //   {json: {'testData': 'test post data added to queue!'}},
  //   function(err, res, body) {
  //     console.log('Compress server tell express');
  //     if (!err && res.statusCode == 200) {
  //       console.log('Status update success', body);
  //     } else {
  //       console.log('Status update error:', body);
  //     }
  //   }
  // );  
};

var addToQueue = function(req, res, next) {

  console.log('--- 1 --- Begin addToQueue: ', req.body);
  
  var s3UniqueHash = req.body.s3UniqueHash;
  var awsStaticUrl = 'https://s3-us-west-1.amazonaws.com/jamrecordtest/audio/';
  var directFileUrl = awsStaticUrl + s3UniqueHash;
  var downloadDestination = path.join( __dirname + '/../temp_audio/hi_res_inbox/' + s3UniqueHash);
  var songID = req.body.songID;

  downloadQueue.push(function(cb) {

    download(directFileUrl, downloadDestination, function(err) {
      console.log('--- 5 --- Begin downloading S3 source', s3UniqueHash);
      if (err) {
        console.log('--- 6 --- Error: file did not download!');
        res.send(500); //TODO: pick the right error for this!
      } else {
        console.log('--- 6 --- File download success ', s3UniqueHash);
        // next();
        // add file to transcoding
        compress(downloadDestination, s3UniqueHash, songID);
      }
    });
    cb();

  });

  console.log('--- 1.5 --- Adds ' + s3UniqueHash + ' to the queue');
  console.log('--- 2 --- Check on length of queue at this time: ', downloadQueue.length);
  console.log('--- 2.5 --- Check on running status: ', downloadQueue.running);
  if (downloadQueue.running === false) {
    console.log('--- 3 --- Auto start queue!');
    startQueue();
  } else {
    console.log('--- 3 --- Dont start queue right now');
  }
};

var startQueue = function() {
  downloadQueue.start(function(err) {
    if (err) {
      console.log('--- 4 --- DownloadQueueError');
    } else {
      console.log('--- 4 --- DownloadQueue confirms starting');
    }
  });
};

var download = function(url, dest, cb) {
  // var totalDownloaded = 0;
  var totalDownloaded = 0;
  var fileSize = 0;
  request
    .get(url, function(err, res) {
      if (err) {
        console.log('--- --- S3 Download failed');
      } else {
        console.log('--- --- S3 Download success');
        cb();
      }
    })
    .on('response', function(res) {
      fileSize = res.headers['content-length'];
      console.log('--- --- Download response from AWS!', res.statusCode, fileSize);
    })
    .on('data', function(data) {
      totalDownloaded += data.length;
      percentDownloaded = Math.floor( (totalDownloaded / fileSize) * 100 );
      // console.log('S3 download progress:', percentDownloaded);
    })
    .pipe(fs.createWriteStream(dest));
  // var request = https.get(url, function(res) {
  //   res.pipe(file);
  //   res.on('data', function(chunk) {
  //     file.write(chunk);
  //     // totalDownloaded += chunk.length;
  //     // var percentDownloaded = Math.floor((totalDownloaded / res.headers['content-length']) * 100);
  //     // console.log('--- 4.5 --- Downlad progress: ', percentDownloaded);
  //   });
  //   file.on('finish', function() {
  //     file.close(cb);  // close() is async, call cb after close completes.
  //   });
  // }).on('error', function(err) { // Handle errors
  //   fs.unlink(dest); // Delete the file async. (But we don't check the result)
  //   if (cb) cb(err.message);
  // });
};

var deleteFile = function(filePath) {
  console.log('--- --- Attept delete');
  fs.unlink(filePath, function(err) {
    if (err) {
      console.log('--- --- Delete errror!');
    } else {
      console.log('--- --- Successfully deleted');
    }
  });
};

var compress = function(hiResFilePath, s3UniqueHash, songID) {
  console.log('--- 7 --- Get ready to read and compress the file!');

  var fileName = s3UniqueHash.split('.')[0];
  var lowResFileName = fileName + '.mp3';
  var lowResFilePath = path.join(__dirname + '/../temp_audio/low_res_outbox/' + lowResFileName);

  var ffmpegCommand = ffmpeg(hiResFilePath)
    .audioCodec('libmp3lame')
    .audioBitrate(256)
    .audioQuality(0)
    .audioChannels(2)
    .on('progress', function(progress) {
      console.log('--- 8 --- Processing: ' + progress.percent + '% done');
    })
    .on('end', function() {
      console.log('--- 8 --- Finished processing');
      deleteFile(hiResFilePath);
      uploadLowRes( lowResFilePath, lowResFileName, songID );
    })
    .on('error', function(err, stdout, stderr) {
      console.log('--- 8 --- Cannot process audio: ' + err.message);
    })
    .save( lowResFilePath );
};

var uploadLowRes = function(filePath, fileName, songID) {
  console.log('--- 9 --- Upload LowRes to S3');
  console.log('--- 9 --- Upload LowRes to S3');

  var putParams = {
    Key: 'audio/' + fileName,
    Bucket: awsConfig.bucket,
    Body: fs.createReadStream(filePath)
  };

  s3.putObject(putParams, function(err, data) {
    if (err) {
      console.log('--- 10 --- S3 upload: ', err)
    }
    else {
      console.log("--- 10.5 --- Successfully uploaded data to ", awsConfig.bucket);
      console.log('--- 10.6 --- Delete this mp3: ', filePath);
      deleteFile(filePath);
      // send fileName to db on primary server
      saveCompressedFileReference(fileName, songID);
    }
  });
}

var saveCompressedFileReference = function(fileName, songID) {
  console.log('--- 11 --- Send request to primary server to save compressed Ref into DB');

  // var dateRecorded = 23432342343;
  // var dateUploaded = 23432343234;
  // var groupId = 1;
  // var name = 'Test name';
  // var description = '';
  // var size = 234556;
  // var awsBucketAddress = fileName;
  // var uniqueHash = '234';
  // var duration = 123455;

  var primaryServerRoute = serverConfig.primaryServer + '/api/addCompressedLink/secret';
  console.log('--- 11.3 --- Attempt DB call to: ', primaryServerRoute);

  request.post(
    primaryServerRoute,
    {
      json:{
        songID: songID,
        compressedID: fileName
      }
    },
    function(err, res, body) {
      if (!err && res.statusCode === 200) {
        console.log('--- 11.5 --- Success putting comprssed link to Primary DB: ');
      } else {
        console.log('--- 11.5 --- Error putting comprssed link to Primary DB: ');
      }
    }
  );
}

module.exports = {
  addToQueue: addToQueue
}
















