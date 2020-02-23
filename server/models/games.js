var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var GameSchema = new Schema({
  GameTitle: String,
  CreatedDate: String,
  UpdatedDate: String 
});

var Games = mongoose.model("Games", GameSchema);

module.exports = Games; 