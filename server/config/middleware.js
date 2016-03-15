var morgan = require('morgan');
var bodyParser = require('body-parser');

var middleware = function (app, express) {
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(express.static(__dirname + '/../../client'));
};

module.exports = middleware;
