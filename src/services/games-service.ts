
import Api from '@/services/Api'
import Params from '@/types/params'

const FEATURED_GAMES_TTL = 5 * 60 * 1000 // 5 minutes
let featuredGamesCache: { promise: Promise<any>; expiresAt: number } | null = null

export default {
  //Games
  fetchGames () {
    return Api().get('games')
  },

  addGame (params: Params) {
    return Api().post('games', params)
  },

  queryGames (params: Params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName});
    var queryValue = params.searchQuery.map(param => { return param.queryValue});

    const isFeaturedQuery =
      queryNames.length === 1 &&
      queryNames[0] === 'IsFeatured' &&
      String(queryValue[0]) === 'true'

    if (isFeaturedQuery) {
      const now = Date.now()
      if (featuredGamesCache && now < featuredGamesCache.expiresAt) {
        return featuredGamesCache.promise
      }
      const promise = Api().get('gameQuery?queryName=IsFeatured&queryValue=true')
      featuredGamesCache = { promise, expiresAt: now + FEATURED_GAMES_TTL }
      return promise
    }

    return Api().get('gameQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },

  updateGame (params: Params) {
    return Api().put('games/' + params.id, params)
  },

  getGame (params: Params) {
    return Api().get('games/' + params.id) 
  },

  deleteGame (id: string) {
    return Api().delete('games/' + id)
  },

  getGameStats (params: Params) {
    return Api().get('games/' + params.id + '/stats')
  }
}