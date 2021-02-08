var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var VideoSchema = new Schema({
    VideoUrl: {
      type: String,
      required: '{PATH} is required!'
    },
    VideoType: {
      type: String
    },
    Match: {
      type: Object
    },
    Players: {
      type: Object
    },
    GameId: {
      type: Number
    },
    TagsIds: {
      type: Array
    },
    ContentType: {
      type: String
    },
    ComboId: {
      type: Number
    }
  }, {
  timestamp: true, 
  });

var Videos = mongoose.model("Videos", VideoSchema);

module.exports = Videos; 