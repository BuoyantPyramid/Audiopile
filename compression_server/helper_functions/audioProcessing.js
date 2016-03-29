var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var queue = require('queue');
var request = require('request');
var ffmpeg = require('fluent-ffmpeg');
var serverConfig = require('../config/server.config.js');
var awsConfig = require('../config/aws.config.js');
var exec = require('child_process').exec;


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
  console.log('--- 1.2 --- Song ID present on input: ', songID);

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
        convertToWav(downloadDestination, s3UniqueHash, songID);
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

var convertToWav = function(hiResFilePath, s3UniqueHash, songID) {
  console.log('--- 6.5 --- Prepare to convert to wav');

  // var lowResFilePath = path.join(__dirname + '/../temp_audio/low_res_outbox/' + lowResFileName);
  var fileName = s3UniqueHash.split('.')[0];
  var tempWavFilename = fileName + '.wav';
  var tempWavPath = path.join(__dirname + '/../temp_audio/wav_temp/' + tempWavFilename);

  // if file is already wav, forward to waveform generator
  // pass on to compression

  // if file is not wav, convert to wav using ffmpeg
  //
  var anythingToWav = ffmpeg(hiResFilePath)
    .setFfmpegPath('/usr/local/bin/ffmpeg')
    // .audioCodec('libmp3lame')
    // .audioBitrate(256)
    // .audioQuality(0)
    // .audioChannels(2)
    .on('progress', function(progress) {
      console.log('--- 6.6 --- Processing: ' + progress.percent + '% done');
    })
    .on('error', function(err, stdout, stderr) {
      console.log('--- 6.6 --- Cannot process temp wav: ' + err.message);
    })
    .on('end', function() {
      console.log('--- 6.6 --- Finished temp wav');
      deleteFile(hiResFilePath);
      generateWaveformArray(tempWavPath, s3UniqueHash, songID);

      // uploadLowRes( lowResFilePath, tempWavFilename, songID );
    })
    .save( tempWavPath );

  // on end compress(downloadDestination, s3UniqueHash, songID)
};

var generateWaveformArray = function(wavTempPath, s3UniqueHash, songID) {
  console.log('--- 6.8 --- Generate waveformArray from temp wav');

  var cmd = 'wav2json ' + wavTempPath + ' -s 200 -p 3 --channels=max -n';
  var wavJsonDataPath = wavTempPath + '.json';

  exec(cmd, function(error, stdout, stderr) {
    // command output is in stdout
    console.log('--- 6.9 ---', error, stdout, stderr);
    if (error) {
      console.log('--- 6.9 ---', error);
      return;
    }
    compress(wavTempPath, s3UniqueHash, songID, wavJsonDataPath);
  });
};

var compress = function(hiResFilePath, s3UniqueHash, songID, wavJsonDataPath) {
  console.log('--- 7 --- Get ready to read and compress the file!');

  var fileName = s3UniqueHash.split('.')[0];
  var lowResFileName = fileName + '.mp3';
  var lowResFilePath = path.join(__dirname + '/../temp_audio/low_res_outbox/' + lowResFileName);



  var ffmpegCommand = ffmpeg(hiResFilePath)
    .setFfmpegPath('/usr/local/bin/ffmpeg')
    .audioCodec('libmp3lame')
    .audioBitrate(256)
    .audioQuality(0)
    .audioChannels(2)

    // .audioFilters(
    //   {
    //     filter: 'acompressor',
    //     options: {
    //       // level_in
    //         // Set input gain. Default is 1. Range is between 0.015625 and 64.
    //       // threshold
    //         // If a signal of second stream rises above this level it will affect the gain reduction of the first stream. By default it is 0.125. Range is between 0.00097563 and 1.
    //       ratio: 24,
    //         // Set a ratio by which the signal is reduced. 1:2 means that if the level rose 4dB above the threshold, it will be only 2dB above after the reduction. Default is 2. Range is between 1 and 20.
    //       // attack
    //         // Amount of milliseconds the signal has to rise above the threshold before gain reduction starts. Default is 20. Range is between 0.01 and 2000.
    //       // release
    //         // Amount of milliseconds the signal has to fall below the threshold before reduction is decreased again. Default is 250. Range is between 0.01 and 9000.
    //       // makeup
    //         // Set the amount by how much signal will be amplified after processing. Default is 2. Range is from 1 and 64.
    //       // knee
    //         // Curve the sharp knee around the threshold to enter gain reduction more softly. Default is 2.82843. Range is between 1 and 8.
    //       // link
    //         // Choose if the average level between all channels of input stream or the louder(maximum) channel of input stream affects the reduction. Default is average.
    //       // detection
    //         // Should the exact signal be taken in case of peak or an RMS one in case of rms. Default is rms which is mostly smoother.
    //       // mix
    //         // How much to use compressed signal in output. Default is 1. Range is between 0 and 1.
    //     }
    //   }
    // )

    .on('progress', function(progress) {
      console.log('--- 8 --- Processing: ' + progress.percent + '% done');
    })
    .on('error', function(err, stdout, stderr) {
      console.log('--- 8 --- Cannot process audio: ' + err.message);
    })
    .on('end', function() {
      console.log('--- 8 --- Finished processing');
      deleteFile(hiResFilePath);
      uploadLowRes( lowResFilePath, lowResFileName, songID, wavJsonDataPath);
    })
    .save( lowResFilePath );
};

var uploadLowRes = function(filePath, fileName, songID, wavJsonDataPath) {
  console.log('--- 9 --- Upload LowRes to S3', wavJsonDataPath);

  var amplitudeData = fs.readFileSync(wavJsonDataPath, 'utf8');

  // mapping the values in waveform array server side
  // Erick is also doing this client side right now
  
  // amplitudeData = JSON.parse(amplitudeData);
  
  // var intAmplitudeArray = amplitudeData.max.map(function(element) {
  //   console.log('Element:', element);
  //   element = Math.floor( element * 100 );
  //   return element
  // });

  // amplitudeData.max = intAmplitudeArray;

  console.log('--- --- ', amplitudeData);

  console.log('--- 9 --- Upload LowRes to S3', amplitudeData);

  var putParams = {
    Key: 'audio/' + fileName,
    Bucket: awsConfig.bucket,
    Body: fs.createReadStream(filePath),
    ACL: 'public-read'
  };

  s3.putObject(putParams, function(err, data) {
    if (err) {
      console.log('--- 10 --- S3 upload: ', err)
    }
    else {
      console.log("--- 10.5 --- Successfully uploaded data to ", awsConfig.bucket);
      console.log('--- 10.6 --- Delete this mp3: ', filePath);
      deleteFile(filePath);
      deleteFile(wavJsonDataPath);
      // send fileName to db on primary server
      saveCompressedFileReference(fileName, songID, amplitudeData);
    }
  });
}

var saveCompressedFileReference = function(fileName, songID, amplitudeData) {
  console.log('--- 11 --- Send request to primary server to save compressed Ref into DB', amplitudeData);

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
  console.log('--- 11.4 --- SongID: ', songID);
  console.log('--- 11.5 --- compressedID: ', fileName);

  console.log('--- 11.5 --- primaryServerRoute: ', primaryServerRoute, songID, fileName);
  request.post(
    primaryServerRoute,
    {
      json:{
        songID: songID,
        compressedID: fileName,
        amplitudeData: amplitudeData
      }
    },
    function(err, res, body) {
      if (!err && res.statusCode === 200) {
        console.log('--- 11.6 --- Success putting comprssed link to Primary DB: ');
      } else {
        console.log('--- 11.6 --- Error putting comprssed link to Primary DB: ', err);
      }
    }
  );
}

module.exports = {
  addToQueue: addToQueue
}

