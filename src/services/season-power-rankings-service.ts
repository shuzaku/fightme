import Api from '@/services/Api'

/**
 * PGR/LumiRank-style seasonal power rankings — computed by
 * MicroServices/ranking-service's `npm run season` from a calendar year's
 * tournament data (real results + outplacement), written to the
 * season-power-rankings collection. A separate, independent system from
 * player-ratings-service.ts's live Glicko-2 rating.
 * See Node-Fighters-Edge/routes/season-power-rankings.js.
 */
export default {
  getLeaderboard (gameId: string, season: number, params?: { limit?: number; page?: number }) {
    const limit = (params && params.limit) || 50
    const page = (params && params.page) || 1
    return Api().get(`season-power-rankings?gameId=${gameId}&season=${season}&limit=${limit}&page=${page}`)
  },

  getAvailableSeasons (gameId: string) {
    return Api().get(`season-power-rankings/seasons?gameId=${gameId}`)
  },

  getPlayerSeasonRanking (playerId: string, gameId: string, season: number) {
    return Api().get(`season-power-rankings/player/${playerId}?gameId=${gameId}&season=${season}`)
  },
}
