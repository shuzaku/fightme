var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var GameSchema = new Schema({
  GameTitle: {
    type: String,
    required: '{PATH} is required!'
  },
  Characters: {
    type: Array
  }
}, {
  timestamp: true
});

var Games = mongoose.model("Games", GameSchema);

module.exports = Games; 