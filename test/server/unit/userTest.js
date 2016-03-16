var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var Sequelize = require('sequelize');
var dbModels = require('../../../server/db/database.js');
var User = dbModels.User;
var UserController = require('../../../server/controllers/user.js');
dbModels.db.options.logging = false;

var req = {
  body: {
    email: 'jake@ooo.com',
    displayName: 'Jake',
    password: 'thedog'
  }
};


var dupeReq = {
  body: {
    email: 'finn@ooo.com',
    displayName: 'Finn',
    password: 'thehoomun'
  }
};

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function(done) {
  var res = {
    json: function() {
      done();
    }
  };
  dbModels.db.query('DELETE from USERS where true')
    .spread(function(results, metadata) {
      UserController.signup(dupeReq, res, console.error);
    });
};



describe('User Controller', function() {

  // Connect to database before any tests
  before(function(done) {
    User.sync({ force: true })
      .then(function() {
        done();
      });
  });
  // Clear database before each test and then seed it with example `users` so that you can run tests
  beforeEach(function(done) {
    clearDB(function() {
      done();
    });
  });
  describe('create user', function() {  
    it('should call res.json to return a json object', function(done) {

      var res = {};
      // make my own damn spy
      res.json = function(jsonresponse) {
        expect(jsonresponse).to.have.property('token');
        done();
      };
      // var spy = res.json = sinon.stub();
      UserController.signup(req, res, console.error);
    });


    it('should create a new user in the database', function(done) {
      var res = {};

      res.json = function(jsonresponse) {
        dbModels.db.query('SELECT * FROM users WHERE email = :email ', { replacements: { email: req.body.email }, type: Sequelize.QueryTypes.SELECT })
          .then(function(users) {
            expect(users[0].email).to.equal(req.body.email);
            done();
          });
      };
      UserController.signup(req, res, console.error);
    });

    it('should store a hashed password', function(done) {
      var res = {};
      res.json = function(jsonresponse) {
        dbModels.db.query('SELECT * FROM users WHERE email = :email ', { replacements: { email: req.body.email }, type: Sequelize.QueryTypes.SELECT })
          .then(function(users) {
            expect(users[0].email).to.equal(req.body.email);
            expect(users[0].password.length).to.be.above(0);
            expect(users[0].password).to.not.equal(req.body.password);
            done();
          });
      };
      UserController.signup(req, res, console.error);
    });

    it('should not allow a duplicate email address', function(done) {
      var res = {};
      UserController.signup(dupeReq, res, function(error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should store a hashed password', function(done) {
      var res = {};
      res.json = function(jsonresponse) {
        dbModels.db.query('SELECT * FROM users WHERE email = :email ', { replacements: { email: req.body.email }, type: Sequelize.QueryTypes.SELECT })
          .then(function(users) {
            expect(users[0].email).to.equal(req.body.email);
            expect(users[0].password.length).to.be.above(0);
            expect(users[0].password).to.not.equal(req.body.password);
            done();
          });
      };
      UserController.signup(req, res, console.error);
    });

    it('should correctly verify a password against the hashed password', function(done) {
      User.findOne({ where: {email: dupeReq.body.email} }).then(function(user) {
        user.comparePassword(dupeReq.body.password)
        .then( function(doesMatch) {
          expect(doesMatch).to.be.true;
          done();
        });
      });
    });

    it('should correctly reject an incorrect password', function(done) {
      User.findOne({ where: {email: dupeReq.body.email} }).then(function(user) {
        user.comparePassword('wrong')
        .then( function(doesMatch) {
          expect(doesMatch).to.be.false;
          done();
        });
      });
    });
  });
  describe('user login', function() {
    it('should login an existing user', function(done) {
      var res = {};
      res.json = function(jsonresponse) {
        expect(jsonresponse).to.have.property('token');
        done();
      };
      UserController.login(dupeReq, res, console.error);
    });
    it('should throw a 404 when logging in a non-existent user', function(done) {
      var res = {};
      res.json = function() {};
      res.status = function(code) {
        expect(code).to.equal(404);
        done();
        return res;
      };
      UserController.login(req, res, console.error);
    });

  });

  describe('profile', function() {
    
    var jwtToken = '';
    beforeEach(function(done) {
      var res = {};
      res.json = function(jsonresponse) {
        jwtToken = jsonresponse.token;
        done();
      };
      UserController.login(dupeReq, res, console.error);
    });

    it('should be able to fetch own profile', function(done) {
      var res = {};
      res.json = function(jsonresponse) {
        expect(JSON.parse(JSON.stringify(jsonresponse))).to.include.keys('email', 'displayName', 'avatarUrl');
        done();
      };
      res.status = function(status) {
        return res;
      };

      dupeReq.headers = { 'x-access-token': jwtToken };
      UserController.getProfile(dupeReq, res, console.error);
    });
    
    it('should throw a 401 with no jwt in header', function(done) {
      dupeReq.headers = {};
      var res = {};
      res.json = function() {};
      res.status = function(code) {
        expect(code).to.equal(401);
        done();
        return res;
      };
      UserController.getProfile(dupeReq, res, console.error);
    });
  });
});
