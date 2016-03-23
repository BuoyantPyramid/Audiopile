var jwt = require('jwt-simple');
var config = require('../config/config.js');
var db = require('../db/database');
var User = db.User;
var JWT_SECRET = config.JWT_SECRET || 's00p3R53kritt';

var errorLogger = function (error, req, res, next) {
  // log the error then send it to the next middleware in
  console.error(error.stack);
  next(error); 
};

var errorHandler = function (error, req, res, next) {
  // send error message to client
  // message for gracefull error handling on app
  res.status(500).json({error: error.message});
};

var verifyToken = function (req, res, next) {
  
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  var tokenUser;

  if (!token) {
    res.status(401).json('No authentication token');
  } else {
    try {
      // decode token and attach user to the request
      // for use inside our controllers
      tokenUser = jwt.decode(token, JWT_SECRET);
      
      // check against database
      if (tokenUser.id && tokenUser.email && tokenUser.password) {
        User.findOne({where: {id: tokenUser.id, email: tokenUser.email, password: tokenUser.password}}).
        then(function(user) {
          req.user = user;
          next();
        });
      } else {
        throw Error('no user associated with that token'); // promise catch will handle this
      }
    } catch (error) {
      res.status(401).json('Bad authentication token');
    }
  }
};


module.exports = {
  errorLogger: errorLogger,
  errorHandler: errorHandler,
  verifyToken: verifyToken
};
