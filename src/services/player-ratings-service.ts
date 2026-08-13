import Api from '@/services/Api'

/**
 * Glicko-2 rating leaderboards — computed by MicroServices/ranking-service
 * from tournament-sets, written to the player-ratings collection.
 * See Node-Fighters-Edge/routes/player-ratings.js.
 */
export default {
  getLeaderboard (gameId: string, params?: { limit?: number; page?: number }) {
    const limit = (params && params.limit) || 50
    const page = (params && params.page) || 1
    return Api().get(`player-ratings?gameId=${gameId}&limit=${limit}&page=${page}`)
  },

  getPlayerRating (playerId: string, gameId: string) {
    return Api().get(`player-ratings/player/${playerId}?gameId=${gameId}`)
  },
}
