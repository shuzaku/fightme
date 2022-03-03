var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CreatorsSchema = new Schema({
  Name: {
    type: String,
    required: '{PATH} is required!'
  },
  LogoUrl: {
    type: String,
  },
  YoutubeUrl: {
    type: String
  }
}, {
  timestamp: true
});

var Creators = mongoose.model("Creators", CreatorsSchema);

module.exports = Creators; 