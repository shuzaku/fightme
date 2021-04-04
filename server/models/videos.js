var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var VideoSchema = new Schema({
    Url: {
      type: String,
      required: '{PATH} is required!'
    },
    ContentType: {
      type: String
    },
    ContentCreatorId: {
      type: String
    },
    VideoType: {
      type: String
    },
    StartTime: {
      type: String
    },
    EndTime: {
      type: String
    },
    GameId: {
      type: String
    },
    ComboId: {
      type: String
    },
    Player1Id: {
      type: String
    },
    Player2Id: {
      type: String
    },
    Player1CharacterIds: {
      type: Array
    },
    Player2CharacterIds: {
      type: Array
    },
    WinnerId: {
      type: String
    },
    Tags: {
      type: Array
    }
  }, {
  timestamp: true, 
  });

var Videos = mongoose.model("Videos", VideoSchema);

module.exports = Videos; 