const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
var Game = require("../models/games");
var Player = require("../models/players");
var Video = require("../models/videos");
var Tag = require("../models/tags");
var Account = require("../models/accounts");
var Creator = require("../models/creators");
var Tournament = require("../models/tournaments");
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

// Add new Account
app.post('/accounts', (req, res) => {
  var db = req.db;
  var DisplayName = req.body.DisplayName;
  var Email = req.body.Email
  var IsEmailVerified = req.body.IsEmailVerified;
  var AccountType = req.body.AccountType;
  var Uid = req.body.Uid;

  var new_account = new Account({
    DisplayName: DisplayName,
    Email: Email,
    IsEmailVerified: IsEmailVerified,
    AccountType: AccountType,
    Uid: Uid,
  })

  new_account.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Account saved successfully!'
    })
  })
})

// Add new post
app.post('/games', (req, res) => {
  var db = req.db;
  var GameTitle = req.body.GameTitle;
  var Characters = req.body.Characters
  var Logo = req.body.Logo;
  var UpdatedDate = req.body.UpdatedDate;
  var new_game = new Game({
    GameTitle: GameTitle,
    Characters: Characters,
    Logo: Logo,
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
  Game.find({}, 'GameTitle Characters Logo UpdatedDate', function (error, games) {
    if (error) { console.error(error); }
    res.send({
      games: games
    })
  }).sort({ _id: -1 })
})

// Fetch single game
app.get('/games/:id', (req, res) => {
  var db = req.db;
  Game.findById(req.params.id, 'GameTitle Characters Logo UpdatedDate', function (error, game) {
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
    Game.find({ $or: queries }, 'GameTitle Characters Logo UpdatedDate', function (error, games) {
      if (error) { console.error(error); }
      res.send({
        games: games
      })
    }).sort({ _id: -1 })    
  }
  else {
    Game.find(queries[0], 'GameTitle Characters Logo UpdatedDate', function (error, games) {
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
  Game.findById(req.params.id, 'GameTitle Characters Logo UpdatedDate', function (error, game) {
    if (error) { console.error(error); }

    game.GameTitle = req.body.GameTitle;
    game.Characters = req.body.Characters
    game.Logo = req.body.Logo;
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
  var Logo = req.body.Logo;
  var GamesPlayed = req.body.GamesPlayed;
  var Region = req.body.PlayerRegion;
  var PlayerImg = req.body.PlayerImg;

  var new_player = new Player({
    PlayerName: PlayerName,
    Logo: Logo,
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
  Player.find({}, 'PlayerName Logo UpdatedDate GamesPlayed Region', function (error, players) {
    if (error) { console.error(error); }
    res.send({
      players: players
    })
  }).sort({ _id: -1 })
})

// Fetch single player
app.get('/players/:id', (req, res) => {
  var db = req.db;
  Player.findById(req.params.id, 'PlayerName Logo UpdatedDate GamesPlayed Region PlayerImg', function (error, player) {
    if (error) { console.error(error); }
    res.send(player)
  })
})

// Update a player
app.put('/players/:id', (req, res) => {
  var db = req.db;
  Player.findById(req.params.id, 'PlayerName Logo UpdatedDate GamesPlayed Region PlayerImg', function (error, player) {
    if (error) { console.error(error); }

    player.PlayerName = req.body.PlayerName;
    player.Logo = req.body.Logo;
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
  var queries = [];

  if(req.query.queryName || req.query.queryValue){
    var names = req.query.queryName.split(",");
    var values = req.query.queryValue.split(",");

    for(var i = 0; i < names.length; i++){
      var query = {};
      query[names[i]] = values[i];
      queries.push(query);
    }
  }

  var skip =  parseInt(req.query.skip);
  
  
  if(!req.query.queryValue) {
    Video.find({}, 'VideoUrl VideoType Players Game Tags ContentType Combo IsInView', function (error, videos) {
      if (error) { console.error(error); }
      res.send({
        videos: videos
      })
    }).sort({ _id: -1 }).limit(10).skip(skip);    
  }
  else if(queries.length > 1) {
    Video.find({ $or: queries }, 'VideoUrl VideoType Players Game Tags ContentType Combo IsInView', function (error, videos) {
      if (error) { console.error(error); }
      res.send({
        videos: videos
      })
    }).sort({ _id: -1 }).limit(10).skip(skip);
  }
  else {
    Video.find(queries[0], 'VideoUrl VideoType Players Game Tags ContentType Combo IsInView', function (error, videos) {
      if (error) { console.error(error); }
      res.send({
        videos: videos
      })
    }).sort({ _id: -1 }).limit(10).skip(skip); 
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

// Add new creator
app.post('/creators', (req, res) => {
  var db = req.db;
  var Name = req.body.Name;
  var Logo = req.body.Logo;
  var YoutubeUrl = req.body.YoutubeUrl;

  var new_creator = new Creator({
    Name: Name,
    Logo: Logo,
    YoutubeUrl: YoutubeUrl
  })

  new_creator.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!'
    })
  })
})

// Fetch all creator
app.get('/creators', (req, res) => {
  Creator.find({}, 'Name Logo YoutubeUrl', function (error, creators) {
    if (error) { console.error(error); }
    res.send({
      creators: creators
    })
  }).sort({ _id: -1 })
})

// Fetch single creator
app.get('/creators/:id', (req, res) => {
  var db = req.db;
  Creator.findById(req.params.id, 'Name Logo YoutubeUrl', function (error, creator) {
    if (error) { console.error(error); }
    res.send(creator)
  })
})

// Update a creator
app.put('/creators/:id', (req, res) => {
  var db = req.db;
  Creator.findById(req.params.id, 'Name Logo YoutubeUrl', function (error, creator) {
    if (error) { console.error(error); }

    creator.Name = req.body.Name;
    creator.Logo = req.body.Logo;
    creator.YoutubeUrl = req.body.YoutubeUrl;

    creator.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true
      })
    })
  })
})

// Delete a creator
app.delete('/creators/:id', (req, res) => {
  var db = req.db;
  Creator.remove({
    _id: req.params.id
  }, function (err, creator) {
    if (err)
      res.send(err)
    res.send({
      success: true
    })
  })
})
// Add new tournament
app.post('/tournaments', (req, res) => {
  var db = req.db;
  var Name = req.body.Name;
  var Games = req.body.Games;

  var new_tournament = new Tournament({
    Name: Name,
    Games: Games
  })

  new_tournament.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!'
    })
  })
})

// Fetch all tournament
app.get('/tournaments', (req, res) => {
  Tournament.find({}, 'Name Games', function (error, tournaments) {
    if (error) { console.error(error); }
    res.send({
      tournaments: tournaments
    })
  }).sort({ _id: -1 })
})

// Fetch single tournament
app.get('/tournaments/:id', (req, res) => {
  var db = req.db;
  Tournament.findById(req.params.id, 'Name Games', function (error, tournament) {
    if (error) { console.error(error); }
    res.send(tournament)
  })
})

// Update a tournament
app.put('/tournaments/:id', (req, res) => {
  var db = req.db;
  Tournament.findById(req.params.id, 'Name Games', function (error, tournament) {
    if (error) { console.error(error); }

    tournament.Name = req.body.Name;
    tournament.Games = req.body.Games;

    tournament.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true
      })
    })
  })
})

// Delete a tournament
app.delete('/tournaments/:id', (req, res) => {
  var db = req.db;
  Tournament.remove({
    _id: req.params.id
  }, function (err, tournament) {
    if (err)
      res.send(err)
    res.send({
      success: true
    })
  })
})


// Add new post
app.post('/characters', (req, res) => {
  var db = req.db;
  var Name = req.body.Name;
  var GameId = req.body.GameId
  var ImageUrl = req.body.ImageUrl;
  var new_character = new Character({
    Name: Name,
    GameId: GameId,
    ImageUrl: ImageUrl,
  })

  new_character.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!'
    })
  })
})

// Fetch all characters
app.get('/characters', (req, res) => {
  Character.find({}, 'Name GameId ImageUrl ', function (error, characters) {
    if (error) { console.error(error); }
    res.send({
      characters: characters
    })
  }).sort({ _id: -1 })
})

// Fetch single character
app.get('/characters/:id', (req, res) => {
  var db = req.db;
  Character.findById(req.params.id, 'Name GameId ImageUrl', function (error, character) {
    if (error) { console.error(error); }
    res.send(character)
  })
})


// Update a character
app.put('/characters/:id', (req, res) => {
  var db = req.db;
  Character.findById(req.params.id, 'Name GameId ImageUrl', function (error, character) {
    if (error) { console.error(error); }

    character.Name = req.body.Name;
    character.GameId = req.body.GameId
    character.ImageUrl = req.body.ImageUrl;
    character.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true
      })
    }) 
  })
})

// Delete a character
app.delete('/characters/:id', (req, res) => {
  var db = req.db;
  Character.remove({
    _id: req.params.id
  }, function (err, character) {
    if (err)
      res.send(err)
    res.send({
      success: true
    })
  })
})


// Add new post
app.post('/combos', (req, res) => {
  var db = req.db;
  var ComboCharacterId = req.body.ComboCharacterId;
  var ComboInput = req.body.ComboInput
  var ComboHits = req.body.ComboHits;
  var ComboDamage = req.body.ComboDamage;

  var new_combo = new Combo({
    ComboCharacterId: ComboCharacterId,
    ComboInput: ComboInput,
    ComboHits: ComboHits,
    ComboDamage: ComboDamage,
  })

  new_combo.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!'
    })
  })
})

// Fetch all combos
app.get('/combos', (req, res) => {
  Combo.find({}, 'ComboCharacterId ComboInput ComboHits ComboDamage', function (error, combos) {
    if (error) { console.error(error); }
    res.send({
      combos: combos
    })
  }).sort({ _id: -1 })
})

// Fetch single combo
app.get('/combos/:id', (req, res) => {
  var db = req.db;
  Combo.findById(req.params.id, 'ComboCharacterId ComboInput ComboHits ComboDamage', function (error, combo) {
    if (error) { console.error(error); }
    res.send(combo)
  })
})


// Update a combo
app.put('/combos/:id', (req, res) => {
  var db = req.db;
  Combo.findById(req.params.id, 'ComboCharacterId ComboInput ComboHits ComboDamage', function (error, combo) {
    if (error) { console.error(error); }

    combo.ComboCharacterId = req.body.ComboCharacterId;
    combo.ComboInput = req.body.ComboInput
    combo.ComboHits = req.body.ComboHits;
    combo.ComboDamage = req.body.ComboDamage;

    combo.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true
      })
    }) 
  })
})

// Delete a combo
app.delete('/combos/:id', (req, res) => {
  var db = req.db;
  Combo.remove({
    _id: req.params.id
  }, function (err, combo) {
    if (err)
      res.send(err)
    res.send({
      success: true
    })
  })
})

