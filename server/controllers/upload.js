var Busboy = require('busboy');

var path = require('path');
var os = require('os');
var fs = require('fs');


var catchUpload = function(req, res, next) {
  var busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    
    var saveTo = path.join(__dirname + '/../uploadInbox/' + filename);
    // console.log(saveTo);

    file.pipe(fs.createWriteStream(saveTo));

    // console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    
    // file.on('data', function(data) {
    //   console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    // });
    
    // file.on('end', function() {
    //   console.log('File [' + fieldname + '] Finished');
    // });
  });
  
  // busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
  //   console.log('Field [' + fieldname + ']: value: ' + inspect(val));
  // });

  busboy.on('finish', function() {
    console.log('Done parsing form!');
    res.writeHead(303, { Connection: 'close', Location: '/' });
    res.end();
  });
  req.pipe(busboy);

  // console.log('Catch upload: ================================', busboy);
};

module.exports = {
  catchUpload: catchUpload,
};