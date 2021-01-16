const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
var Game = require("../models/games");
var Player = require("../models/players");
var Video = require("../models/videos");
var Tag = require("../models/tags");
var mongoose = require('mongoose');


const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

mongoose.connect('mongodb+srv://mtchau:CSLNsZTp!pqf3cA@fightme.vdh52.mongodb.net/mongotest?retryWrites=true&w=majority');
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function (callback) {
  console.log("Connection Succeeded");
});

// Add new post
app.post('/games', (req, res) => {
  var db = req.db;
  var GameTitle = req.body.GameTitle;
  var Characters = req.body.Characters
  var CreatedDate = req.body.CreatedDate;
  var UpdatedDate = req.body.UpdatedDate;
  var new_game = new Game({
    GameTitle: GameTitle,
    Characters: Characters,
    CreatedDate: CreatedDate,
    UpdatedDate: UpdatedDate
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
  Game.find({}, 'GameTitle Characters CreatedDate UpdatedDate', function (error, games) {
    if (error) { console.error(error); }
    res.send({
      games: games
    })
  }).sort({ _id: -1 })
})

// Fetch single game
app.get('/games/:id', (req, res) => {
  var db = req.db;
  Game.findById(req.params.id, 'GameTitle Characters CreatedDate UpdatedDate', function (error, game) {
    if (error) { console.error(error); }
    res.send(game)
  })
})

// Query Games
app.get('/gameQuery', (req, res) => {
  var db = req.db;
  var names = req.query.queryName.split(",");
  var values = req.query.queryValue.split(",");
  var queries = [];

  for(var i = 0; i < names.length; i++){
    var query = {};
    query[names[i]] = values[i];
    queries.push(query);
  }
  
  if(queries.length > 1) {
    Game.find({ $or: queries }, 'GameTitle Characters CreatedDate UpdatedDate', function (error, games) {
      if (error) { console.error(error); }
      res.send({
        games: games
      })
    }).sort({ _id: -1 })    
  }
  else {
    Game.find(queries[0], 'GameTitle Characters CreatedDate UpdatedDate', function (error, games) {
      if (error) { console.error(error); }
      res.send({
        games: games
      })
    }).sort({ _id: -1 })    
  }
})

// Update a game
app.put('/games/:id', (req, res) => {
  var db = req.db;
  Game.findById(req.params.id, 'GameTitle Characters CreatedDate UpdatedDate', function (error, game) {
    if (error) { console.error(error); }

    game.GameTitle = req.body.GameTitle;
    game.Characters = req.body.Characters
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
  var Region = req.body.PlayerRegion;
  var PlayerImg = req.body.PlayerImg;

  var new_player = new Player({
    PlayerName: PlayerName,
    CreatedDate: CreatedDate,
    UpdatedDate: null,
    GamesPlayed: GamesPlayed,
    Region: Region,
    PlayerImg: PlayerImg
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
  Player.findById(req.params.id, 'PlayerName CreatedDate UpdatedDate GamesPlayed Region PlayerImg', function (error, player) {
    if (error) { console.error(error); }
    res.send(player)
  })
})

// Update a player
app.put('/players/:id', (req, res) => {
  var db = req.db;
  Player.findById(req.params.id, 'PlayerName CreatedDate UpdatedDate GamesPlayed Region PlayerImg', function (error, player) {
    if (error) { console.error(error); }

    player.PlayerName = req.body.PlayerName;
    player.CreatedDate = req.body.CreatedDate;
    player.UpdatedDate = req.body.UpdatedDate;
    player.GamesPlayed = req.body.GamesPlayed,
    player.Region = req.body.Region
    player.PlayerImg = req.body.PlayerImg

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

// Add new Video
app.post('/videos', (req, res) => {
  var db = req.db;
  var VideoUrl = req.body.VideoUrl;
  var VideoType = req.body.VideoType
  var Players = req.body.Players;
  var Game = req.body.Game;
  var Tags = req.body.Tags;
  var ContentType = req.body.ContentType;
  var Combo = req.body.Combo;
  var IsInView = req.body.IsInView;

  var new_video = new Video({
    VideoUrl: VideoUrl,
    VideoType: VideoType,
    Players: Players,
    Game: Game,
    Tags: Tags,
    ContentType: ContentType,
    Combo: Combo,
    IsInView: IsInView
  })

  new_video.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!'
    })
  })
})

// Fetch all Video
app.get('/videos', (req, res) => {
  var query = req.query;
  var skip = parseInt(req.query.skip);
  console.log(skip)
    Video.find({}, 'VideoUrl VideoType Players Game Tags ContentType Combo IsInView', function (error, videos) {
      if (error) { console.error(error); }
      res.send({
        videos: videos
      })
    }).sort({ _id: -1 }).limit(10).skip(skip);
})

// Query Videos
app.get('/videoQuery', (req, res) => {
  var db = req.db;
  var names = req.query.queryName.split(",");
  var values = req.query.queryValue.split(",");
  var queries = [];

  for(var i = 0; i < names.length; i++){
    var query = {};
    query[names[i]] = values[i];
    queries.push(query);
  }
  
  if(queries.length > 1) {
    Video.find({ $or: queries }, 'VideoUrl VideoType Players Game Tags ContentType Combo IsInView', function (error, videos) {
      if (error) { console.error(error); }
      res.send({
        videos: videos
      })
    }).sort({ _id: -1 })    
  }
  else {
    Video.find(queries[0], 'VideoUrl VideoType Players Game Tags ContentType Combo IsInView', function (error, videos) {
      if (error) { console.error(error); }
      res.send({
        videos: videos
      })
    }).sort({ _id: -1 })    
  }
})

// Fetch single Video
app.get('/videos/:id', (req, res) => {
  var db = req.db;
  Videos.findById(req.params.id, 'VideoUrl VideoType Players Game Tags ContentType Combo IsInView', function (error, video) {
    if (error) { console.error(error); }
    res.send(video)
  })
})

// Update a Video
app.put('/videos/:id', (req, res) => {
  var db = req.db;
  Video.findById(req.params.id, 'VideoUrl VideoType Players Game Tags ContentType Combo', function (error, video) {
    if (error) { console.error(error); }

    video.VideoUrl = req.body.VideoUrl;
    video.Players = req.body.Players;
    video.Game = req.body.Game;
    video.Combo = req.body.Combo;

    video.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true
      })
    })
  })
})

// Delete a Video
app.delete('/videos/:id', (req, res) => {
  var db = req.db;
  Video.remove({
    _id: req.params.id
  }, function (err, video) {
    if (err)
      res.send(err)
    res.send({
      success: true
    })
  })
})

// Fetch all Tag
app.get('/tags', (req, res) => {
  Tag.find({}, 'TagName', function (error, tags) {
    if (error) { console.error(error); }
    res.send({
      tags: tags
    })
  }).sort({ _id: -1 })
})

// Add new Tag
app.post('/tags', (req, res) => {
  var db = req.db;
  var TagName = req.body.TagName;

  var new_tag = new Tag({
    TagName: TagName
  })

  new_tag.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Tag saved successfully!'
    })
  })
})
app.listen(process.env.PORT || 8081)

