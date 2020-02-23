const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
var Game = require("../models/games");
var Player = require("../models/players");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

mongoose.connect('mongodb://mtchau:Test1234@ds249267.mlab.com:49267/mongotest');
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function (callback) {
  console.log("Connection Succeeded");
});

// Add new post
app.post('/games', (req, res) => {
  var db = req.db;
  var GameTitle = req.body.GameTitle;
  var CreatedDate = req.body.CreatedDate;
  var UpdatedDate = req.body.UpdatedDate;
  var new_game = new Game({
    GameTitle: GameTitle,
    CreatedDate: CreatedDate,
    UpdatedDate: null
  })

  new_game.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!'
    })
  })
})

// Fetch all games
app.get('/games', (req, res) => {
  Game.find({}, 'GameTitle CreatedDate UpdatedDate', function (error, games) {
    if (error) { console.error(error); }
    res.send({
      games: games
    })
  }).sort({ _id: -1 })
})

// Fetch single game
app.get('/games/:id', (req, res) => {
  var db = req.db;
  Game.findById(req.params.id, 'GameTitle CreatedDate UpdatedDate', function (error, game) {
    if (error) { console.error(error); }
    res.send(game)
  })
})

// Update a game
app.put('/games/:id', (req, res) => {
  var db = req.db;
  Game.findById(req.params.id, 'GameTitle CreatedDate UpdatedDate', function (error, game) {
    if (error) { console.error(error); }

    game.GameTitle = req.body.GameTitle;
    game.CreatedDate = req.body.CreatedDate;
    game.UpdatedDate = req.body.UpdatedDate;
    game.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true
      })
    })
  })
})

// Delete a game
app.delete('/games/:id', (req, res) => {
  var db = req.db;
  Game.remove({
    _id: req.params.id
  }, function (err, game) {
    if (err)
      res.send(err)
    res.send({
      success: true
    })
  })
})


// Add new player
app.post('/players', (req, res) => {
  var db = req.db;
  var PlayerName = req.body.PlayerName;
  var CreatedDate = req.body.CreatedDate;
  var GamesPlayed = req.body.GamesPlayed;
  var Region = req.body.Region;

  var new_player = new Player({
    PlayerName: PlayerName,
    CreatedDate: CreatedDate,
    UpdatedDate: null,
    GamesPlayed: GamesPlayed,
    Region: Region
  })

  new_player.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!'
    })
  })
})

// Fetch all player
app.get('/players', (req, res) => {
  Player.find({}, 'PlayerName CreatedDate UpdatedDate GamesPlayed Region', function (error, players) {
    if (error) { console.error(error); }
    res.send({
      players: players
    })
  }).sort({ _id: -1 })
})

// Fetch single player
app.get('/players/:id', (req, res) => {
  var db = req.db;
  Player.findById(req.params.id, 'PlayerName CreatedDate UpdatedDate GamesPlayed Region', function (error, player) {
    if (error) { console.error(error); }
    res.send(player)
  })
})

// Update a player
app.put('/players/:id', (req, res) => {
  var db = req.db;
  Player.findById(req.params.id, 'PlayerName CreatedDate UpdatedDate GamesPlayed Region', function (error, player) {
    if (error) { console.error(error); }

    player.PlayerName = req.body.PlayerName;
    player.CreatedDate = req.body.CreatedDate;
    player.UpdatedDate = req.body.UpdatedDate;
    player.GamesPlayed = req.body.GamesPlayed,
    player.Region = req.body.Region

    player.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true
      })
    })
  })
})

// Delete a player
app.delete('/players/:id', (req, res) => {
  var db = req.db;
  Player.remove({
    _id: req.params.id
  }, function (err, player) {
    if (err)
      res.send(err)
    res.send({
      success: true
    })
  })
})




app.listen(process.env.PORT || 8081)

