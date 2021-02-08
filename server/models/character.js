const { intersection } = require("lodash");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CharacterSchema = new Schema({
  Name: {
    type: String,
    required: '{PATH} is required!'
  },
  GameId: {
    type: Number,
    required: '{Path} is required'
  }
}, {
  timestamp: true
});

var Character = mongoose.model("Character", CharacterSchema);

module.exports = Character; 