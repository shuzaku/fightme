var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
  Name: {
    type: String,
    required: '{PATH} is required!'
  },
  ImageUrl: {
    type: String
  }
}, {
  timestamp: true
});

var Players = mongoose.model("Players", PlayerSchema);

module.exports = Players; 