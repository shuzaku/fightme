var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var VideoSchema = new Schema({
    VideoUrl: {
      type: String,
      required: '{PATH} is required!'
    },
    VideoType: {
      type: String,
    },
    Players: {
      type: Object,
    },
    Game: {
      type: String,
      required: '{PATH} is required!'
    }
  }, {
  timestamp: true, 
  });

var Videos = mongoose.model("Videos", VideoSchema);

module.exports = Videos; 