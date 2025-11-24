// Get game statistics (counts only)
function getGameStats(gameId) {
    return new Promise((resolve, reject) => {
        var Character = require("../models/characters");
        var Video = require("../models/videos");
        var TournamentMatch = require("../models/tournament-matches");
        var Tournament = require("../models/tournaments");
        var ObjectId = require('mongodb').ObjectId;

        var gameIdObj = ObjectId(gameId);

        // Run all count queries in parallel
        Promise.all([
            // Count characters
            Character.countDocuments({ GameId: gameIdObj }),
            // Count online matches (videos with ContentType 'Match' and VideoType 'Online Match')
            Video.countDocuments({ 
                GameId: gameIdObj, 
                ContentType: 'Match',
                VideoType: 'Online Match'
            }),
            // Count tournament matches
            TournamentMatch.countDocuments({ GameId: gameIdObj }),
            // Count tournaments (where Games array contains the gameId)
            Tournament.countDocuments({ Games: gameIdObj }),
            // Count combos (videos with ContentType 'Combo')
            Video.countDocuments({ 
                GameId: gameIdObj, 
                ContentType: 'Combo'
            })
        ])
        .then(([characters, onlineMatches, tournamentMatches, tournaments, combos]) => {
            resolve({
                characters: characters,
                matches: onlineMatches + tournamentMatches, // Combined match count
                tournaments: tournaments,
                combos: combos
            });
        })
        .catch(error => {
            reject(error);
        });
    });
}

module.exports = {
    addGame,
    getGames,
    getGame,
    queryGame,
    updateGame,
    deleteGame,
    getGameStats  // Add this
};
