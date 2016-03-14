var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/config');
var path = require('path');
var webpackMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var webpackConfig = require('../webpack.config.js');
var webpack = require('webpack');

var app = express();
var isDeveloping = process.env.NODE_ENV !== 'production';

// connect to mongo database named "dropnet"
mongoose.connect(config.mongoURL);


var normalizePort = function(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// Get port from environment and store in Express.
config.port = normalizePort(process.env.PORT || config.port);

// configure our server with all the middleware and routing
require('./config/middleware.js')(app, express);
require('./config/routes.js')(app, express);


if (isDeveloping) {
  var compiler = webpack(webpackConfig);
  var middleware = webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', function response(req, res) {
    if (req.accepts('html')) {
      res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
      res.end();
    }
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}


// start listening to requests on port 8000
app.listen(config.port, function() { console.log('==> 🌎 listening on port: ', config.port); });

// export our app for testing and flexibility, required by index.js
module.exports = app;
