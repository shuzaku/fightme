var Video = require("../models/videos");


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
  var Player2CharacterId = req.body.Player2CharacterId;
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
    Player2CharacterId: Player2CharacterId,
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

  var aggregate = []

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
    Video.aggregate([
      {$set: {GameId: {$toObjectId: "$GameId"} }},
      {$lookup: {
        from: "games",
        localField: "GameId",
        foreignField: "_id",
        as: "Game"
        }
      },
      {$unwind: '$Game'},
      {$set: {ContentCreatorId: {$toObjectId: "$ContentCreatorId"} }},
      {$lookup: {
        from: "creators",
        localField: "ContentCreatorId",
        foreignField: "_id",
        as: "ContentCreator"
        }
      },
      {$unwind: '$ContentCreator'},
      {$set: {Player1Id: {$toObjectId: "$Player1Id"} }},
      {$lookup: {
        from: "players",
        localField: "Player1Id",
        foreignField: "_id",
        as: "Player1"
        }
      },
      {$unwind: '$Player1'},
      {$set: {Player2Id: {$toObjectId: "$Player2Id"} }},
      {$lookup: {
        from: "players",
        localField: "Player2Id",
        foreignField: "_id",
        as: "Player2"
        }
      },
      {$unwind: '$Player2'},
      {$set: {'Player1CharacterId': {$toObjectId: "$Player1CharacterId"} }},
      {$lookup: {
        from: "characters",
        localField: "Player1CharacterId",
        foreignField: "_id",
        as: "Player1Character"
        }
      },
      {$unwind: '$Player1Character'},
      {$set: {'Player2CharacterId': {$toObjectId: "$Player2CharacterId"} }},
      {$lookup: {
        from: "characters",
        localField: "Player2CharacterId",
        foreignField: "_id",
        as: "Player2Character"
        }
      },
      {$unwind: '$Player2Character'},
      {$set: {'ComboId': {$toObjectId: "$ComboId"} }},
      {$lookup: {
        from: "combos",
        localField: "ComboId",
        foreignField: "_id",
        as: "Combo"
        }
      },
      {$unwind: '$Combo'},
      {$set: {'Combo.CharacterId': {$toObjectId: "$Combo.CharacterId"} }},
      {$lookup: {
        from: "characters",
        localField: "Combo.CharacterId",
        foreignField: "_id",
        as: "ComboCharacter"
        }
      },
      {$unwind: '$ComboCharacter'},
      {$skip: skip},
      {$limit: 5},
      {$sort: {_id: -1}}
    ], function (error, videos) {
      if (error) { console.error(error); }
      res.send({
        videos: videos
      })
    })
  }
  else if(queries.length > 1) {
    Video.aggregate([
      {$match: {$or: queries}},
      {$set: {GameId: {$toObjectId: "$GameId"} }},
      {$lookup: {
        from: "games",
        localField: "GameId",
        foreignField: "_id",
        as: "Game"
        }
      },
      {$unwind: '$Game'},
      {$set: {ContentCreatorId: {$toObjectId: "$ContentCreatorId"} }},
      {$lookup: {
        from: "creators",
        localField: "ContentCreatorId",
        foreignField: "_id",
        as: "ContentCreator"
        }
      },
      {$unwind: '$ContentCreator'},
      {$set: {Player1Id: {$toObjectId: "$Player1Id"} }},
      {$lookup: {
        from: "players",
        localField: "Player1Id",
        foreignField: "_id",
        as: "Player1"
        }
      },
      {$unwind: '$Player1'},
      {$set: {Player2Id: {$toObjectId: "$Player2Id"} }},
      {$lookup: {
        from: "players",
        localField: "Player2Id",
        foreignField: "_id",
        as: "Player2"
        }
      },
      {$unwind: '$Player2'},
      {$set: {'Player1CharacterId': {$toObjectId: "$Player1CharacterId"} }},
      {$lookup: {
        from: "characters",
        localField: "Player1CharacterId",
        foreignField: "_id",
        as: "Player1Character"
        }
      },
      {$unwind: '$Player1Character'},
      {$set: {'Player2CharacterId': {$toObjectId: "$Player2CharacterId"} }},
      {$lookup: {
        from: "characters",
        localField: "Player2CharacterId",
        foreignField: "_id",
        as: "Player2Character"
        }
      },
      {$unwind: '$Player2Character'},
      {$skip: skip},
      {$limit: 5},
      {$sort: {_id: -1}}
    ], function (error, videos) {
      if (error) { console.error(error); }
      res.send({
        videos: videos
      })
    })
  }
  else {
    Video.aggregate([
      {$match: {$or: queries}},
      {$set: {GameId: {$toObjectId: "$GameId"} }},
      {$lookup: {
        from: "games",
        localField: "GameId",
        foreignField: "_id",
        as: "Game"
        }
      },
      {$unwind: '$Game'},
      {$set: {ContentCreatorId: {$toObjectId: "$ContentCreatorId"} }},
      {$lookup: {
        from: "creators",
        localField: "ContentCreatorId",
        foreignField: "_id",
        as: "ContentCreator"
        }
      },
      {$unwind: '$ContentCreator'},
      {$set: {Player1Id: {$toObjectId: "$Player1Id"} }},
      {$lookup: {
        from: "players",
        localField: "Player1Id",
        foreignField: "_id",
        as: "Player1"
        }
      },
      {$unwind: '$Player1'},
      {$set: {Player2Id: {$toObjectId: "$Player2Id"} }},
      {$lookup: {
        from: "players",
        localField: "Player2Id",
        foreignField: "_id",
        as: "Player2"
        }
      },
      {$unwind: '$Player2'},
      {$set: {'Player1CharacterId': {$toObjectId: "$Player1CharacterId"} }},
      {$lookup: {
        from: "characters",
        localField: "Player1CharacterId",
        foreignField: "_id",
        as: "Player1Character"
        }
      },
      {$unwind: '$Player1Character'},
      {$set: {'Player2CharacterId': {$toObjectId: "$Player2CharacterId"} }},
      {$lookup: {
        from: "characters",
        localField: "Player2CharacterId",
        foreignField: "_id",
        as: "Player2Character"
        }
      },
      {$unwind: '$Player2Character'},
      {$skip: skip},
      {$limit: 5},
    ], function (error, videos) {
      if (error) { console.error(error); }
      res.send({
        videos: videos
      })
    }).sort({ _id: -1 })
  }
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