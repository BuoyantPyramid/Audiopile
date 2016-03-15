var db = require('../db/database');
var Group = db.Group;
var Song = db.Song;

var createGroup = function(req, res) {
  Group.create({
    name: req.body.name
    // TODO: Add banner
  }).then(function(group) {
    res.send(JSON.stringify(group));
  })
  .catch(function(err) {
    res.send(err);
  });
};

var fetchSongs = function(req, res) {
  Group.findAll({
    where: {
      id: req.params.id
    },
    include: {model: Song},
    raw: true})
  .then(function(group) {
    var songs = group.map(function(song) {
      return song['songs.title'];
    });
    res.send(JSON.stringify(songs));
  })
  .catch(function(err) {
    res.send(err);
  });
};


module.exports = {
  createGroup: createGroup,
  fetchSongs: fetchSongs
};
