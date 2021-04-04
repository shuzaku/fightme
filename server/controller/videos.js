var Video = require("../models/videos");
var ObjectId = require('mongodb').ObjectId;

// Add new Video
function addVideo(req, res) {
  var Url = req.body.Url;
  var ContentType = req.body.ContentType
  var ContentCreatorId = req.body.ContentCreatorId;
  var VideoType = req.body.VideoType;
  var StartTime = req.body.StartTime;
  var EndTime = req.body.EndTime;
  var GameId = req.body.GameId;
  var ComboId = req.body.ComboId;
  var Player1Id = req.body.Player1Id;
  var Player2Id = req.body.Player2Id;
  var Player1CharacterId = req.body.Player1CharacterId;
  var Player1Character2Id = req.body.Player1Character2Id;
  var Player1Character3Id = req.body.Player1Character3Id;
  var Player2CharacterId = req.body.Player2CharacterId;
  var Player2Character2Id = req.body.Player2Character2Id;
  var Player2Character3Id = req.body.Player2Character3Id;
  var WinnerId = req.body.WinnerId;
  var Tags = req.body.Tags;

  var new_video = new Video({
    Url: Url,
    ContentType: ContentType,
    ContentCreatorId: ContentCreatorId,
    VideoType: VideoType,
    StartTime: StartTime,
    EndTime: EndTime,
    GameId: GameId,
    ComboId: ComboId,
    Player1Id: Player1Id,
    Player2Id: Player2Id,
    Player1CharacterId: Player1CharacterId,
    Player1Character2Id:Player1Character2Id,
    Player1Character3Id:Player1Character3Id,
    Player2CharacterId: Player2CharacterId,
    Player2Character2Id:Player2Character2Id,
    Player2Character3Id:Player2Character3Id,
    WinnerId: WinnerId,
    Tags: Tags
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
}

// Fetch all Video
function getVideos(req, res) {
  var query = req.query;
  var skip = parseInt(req.query.skip);
    Video.find({}, 'Url Type ContentCreatorId VideoType StartTime EndTime GameId ComboId Match Tags', function (error, videos) {
      if (error) { console.error(error); }
      res.send({
        videos: videos
      })
    }).sort({ _id: -1 }).limit(5).skip(skip);
}

// Query Videos
function queryVideo(req, res) {
  var queries = [];
  var query = null;
  if (req.query.queryName || req.query.queryValue){
    var names = req.query.queryName.split(",");
    var values = req.query.queryValue.split(",");

    if (names.length > 0){
      for(var i = 0; i < names.length; i++){
        var query = {};
        if (names[i].includes('Id')) {
          query[names[i]] =  {'$eq': ObjectId(values[i])}
        }
        else {
          query[names[i]] =  {'$eq': values[i]}
        }
        queries.push(query);
      }
    }
  }

  var skip =  parseInt(req.query.skip);
  
  var aggregate = [    
    {$sort: {_id: -1}},
    {$lookup: {
      from: "games",
      localField: "GameId",
      foreignField: "_id",
      as: "Game"
      }
    },
    {$unwind: '$Game'},
    {$lookup: {
      from: "creators",
      localField: "ContentCreatorId",
      foreignField: "_id",
      as: "ContentCreator"
      }
    },
    {$unwind: {path:'$ContentCreator', preserveNullAndEmptyArrays: true}},
    {$lookup: {
      from: "players",
      localField: "Player1Id",
      foreignField: "_id",
      as: "Player1"
      }
    },
    {$unwind: {path:'$Player1', preserveNullAndEmptyArrays: true}},
    {$lookup: {
      from: "players",
      localField: "Player2Id",
      foreignField: "_id",
      as: "Player2"
      }
    },
    {$unwind: {path:'$Player2', preserveNullAndEmptyArrays: true}},
    {$lookup: {
      from: "characters",
      localField: "Player1CharacterId",
      foreignField: "_id",
      as: "Player1Character"
      }
    },
    {$unwind: {path:'$Player1Character', preserveNullAndEmptyArrays: true}},
    {$lookup: {
      from: "characters",
      localField: "Player1Character2Id",
      foreignField: "_id",
      as: "Player1Character2"
      }
    },
    {$unwind: {path:'$Player1Character2', preserveNullAndEmptyArrays: true}},
    {$lookup: {
      from: "characters",
      localField: "Player1Character3Id",
      foreignField: "_id",
      as: "Player1Character3"
      }
    },
    {$unwind: {path:'$Player1Character3', preserveNullAndEmptyArrays: true}},
    {$lookup: {
      from: "characters",
      localField: "Player2CharacterId",
      foreignField: "_id",
      as: "Player2Character"
      }
    },
    {$unwind: {path:'$Player2Character', preserveNullAndEmptyArrays: true}},
    {$lookup: {
      from: "characters",
      localField: "Player2Character2Id",
      foreignField: "_id",
      as: "Player2Character2"
      }
    },
    {$unwind: {path:'$Player2Character2', preserveNullAndEmptyArrays: true}},
    {$lookup: {
      from: "characters",
      localField: "Player2Character3Id",
      foreignField: "_id",
      as: "Player2Character3"
      }
    },
    {$unwind: {path:'$Player2Character3', preserveNullAndEmptyArrays: true}},
    {$lookup: {
      from: "combos",
      localField: "ComboId",
      foreignField: "_id",
      as: "Combo"
      }
    },
    {$unwind: {path:'$Combo', preserveNullAndEmptyArrays: true}},
    {$set: {'Combo.CharacterId': {$toObjectId: "$Combo.CharacterId"} }},
    {$lookup: {
      from: "characters",
      localField: "Combo.CharacterId",
      foreignField: "_id",
      as: "ComboCharacter"
      }
    },
    {$unwind: {path:'$ComboCharacter', preserveNullAndEmptyArrays: true}}
  ];

  if(queries.length > 0) {
    aggregate.push({$match: {$or: queries}});
  }

  aggregate.push({$skip: skip});
  aggregate.push({$limit: 5});  

  console.log(aggregate);

  Video.aggregate(aggregate, function (error, videos) {
    if (error) { console.error(error); }
    res.send({
      videos: videos
    })
  })
}

// Fetch single Video
function getVideo(req, res) {
  Videos.findById(req.params.id, 'Url ContentType ContentCreatorId VideoType StartTime EndTime GameId ComboId Match Tags', function (error, video) {
    if (error) { console.error(error); }
    res.send(video)
  })
}

// Update a Video
function updateVideo(req, res) {
  Video.findById(req.params.id, 'Url ContentType ContentCreatorId VideoType StartTime EndTime GameId ComboId Match Tags', function (error, video) {
    if (error) { console.error(error); }

    video.Url = req.body.Url;
    video.ContentType = req.body.ContentType;
    video.ContentCreatorId = req.body.ContentCreatorId;
    video.VideoType = req.body.VideoType;
    video.StartTime = req.body.StartTime;
    video.EndTime = req.body.EndTime;
    video.GameId = req.body.GameId;
    video.ComboId = req.body.ComboId;
    video.Match = req.body.Match;
    video.Tags = req.body.Tags;

    video.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true
      })
    })
  })
}

// Delete a Video
function deleteVideo(req, res) {
  Video.remove({
    _id: req.params.id
  }, function (err, video) {
    if (err)
      res.send(err)
    res.send({
      success: true
    })
  })
}

module.exports = { addVideo, getVideos, queryVideo, getVideo, updateVideo, deleteVideo}