var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
  PlayerName: String,
  CreatedDate: String,
  UpdatedDate: String,
  GamesPlayed: Array,
  Region: String
});

var Players = mongoose.model("Players", PlayerSchema);

module.exports = Players; 