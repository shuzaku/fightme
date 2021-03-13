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
      type: Schema.Types.ObjectId
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
      type: Schema.Types.ObjectId
    },
    // ComboId: {
    //   type: Schema.Types.ObjectId
    // },
    Player1Id: {
      type: Schema.Types.ObjectId
    },
    Player2Id: {
      type: Schema.Types.ObjectId
    },
    Player1CharacterId: {
      type: Schema.Types.ObjectId
    },
    Player2CharacterId: {
      type: Schema.Types.ObjectId
    },
    WinnerId: {
      type: Schema.Types.ObjectId
    },
    Tags: {
      type: Array
    }
  }, {
  timestamp: true, 
  });

var Videos = mongoose.model("Videos", VideoSchema);

module.exports = Videos; 