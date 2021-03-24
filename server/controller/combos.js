var Combo = require("../models/combos");

// Add new Combo
function addCombos(req, res) {
  var GameId = req.body.GameId;
  var CharacterId = req.body.CharacterId;
  var Inputs = req.body.Inputs;

  var new_combo = new Combo({
    GameId: GameId,
    CharacterId: CharacterId,
    Inputs: Inputs,
  })

  new_combo.save(function (error,combo) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!',
      id: combo.id
    })
  })
}

module.exports = { addCombos }