var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ComboSchema = new Schema({
  GameId: {
    type: String
  },
  CharacterId: {
    type: String
  },
  Inputs: {
    type: Array
  }
}, {
  timestamp: true
});

var Combo = mongoose.model("Combo", ComboSchema);

module.exports = Combo; 