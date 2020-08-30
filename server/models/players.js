var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
  PlayerName: {
    type: String,
    required: '{PATH} is required!'
  },
  GamesPlayed: {
    type: Array
  },
  Region: {
    type: String
  },
  PlayerImg: {
    type: String
  }
}, {
  timestamp: true
});

var Players = mongoose.model("Players", PlayerSchema);

module.exports = Players; 