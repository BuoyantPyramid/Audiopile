var db = require('../db/database');
var Song = db.Song;
var Group = db.Group;

var addSong = function(req, res) {
  var groupId = req.body.groupId;
  Song.create({
    title: req.body.title,
    description: req.body.description,
    dateRecorded: Date.now(), // TODO: Receive from UI?
    duration: 100, // TODO: Receive from UI?
    // TODO: Add address and imageURL
    groupId: groupId
  },
  {include: {
    model: Group}
  }).then(function(song) {
    res.send(JSON.stringify(song));
  })
  .catch(function(err) {
    res.send(err);
  });
};

module.exports = {
  addSong: addSong
};
