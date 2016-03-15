// TODO: Make this file a template

var pg = require('pg');
var Sequelize = require('sequelize');

// Copy the contents of this file into a new file named config.js
// and complete commented lines
var port = 3000;

var connectionString = 'postgres://localhost:5432/jams';
var db = new Sequelize(connectionString);

module.exports = {
  port: port,
  db: db
};
