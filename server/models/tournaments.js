var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TournamentsSchema = new Schema({
  Name: {
    type: String,
    required: '{PATH} is required!'
  },
  Games: {
    type: String,
  }
}, {
  timestamp: true
});

var Tournaments = mongoose.model("Tournaments", TournamentsSchema);

module.exports = Tournaments; 