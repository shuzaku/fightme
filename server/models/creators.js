var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CreatorsSchema = new Schema({
  Name: {
    type: String,
    required: '{PATH} is required!'
  },
  Logo: {
    type: String,
  },
  YoutubeUrl: {
    type: Boolean
  }
}, {
  timestamp: true
});

var Creators = mongoose.model("Creators", CreatorsSchema);

module.exports = Creators; 