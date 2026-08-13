import Api from '@/services/Api'

/**
 * Raw bracket-data tournament/match history for a player (tournaments attended,
 * placements, and per-set results) — see Node-Fighters-Edge/routes/player-tournament-history.js.
 * Distinct from the curated video-clip feed (matches-service / tournament-match-service).
 */
export default {
  getPlayerTournamentHistory (
    playerId: string,
    params?: { page?: number; limit?: number; year?: number | string | null; gameId?: string | null }
  ) {
    const page = (params && params.page) || 1
    const limit = (params && params.limit) || 10
    const query = [`page=${page}`, `limit=${limit}`]
    if (params && params.year) {
      query.push(`year=${params.year}`)
    }
    if (params && params.gameId) {
      query.push(`gameId=${params.gameId}`)
    }
    return Api().get(`players/${playerId}/tournament-history?${query.join('&')}`)
  },
}
