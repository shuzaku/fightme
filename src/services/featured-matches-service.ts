
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  fetchFeaturedMatches (params: Params) {
    var url='/featured-matches'
    if (params){
      url += `?${params.limit ? `limit=${params.limit}` : ''}${params.sort ? `&sort=${params.sort}` : ''}${params.sortDirection ? `&sortDirection=${params.sortDirection}` : ''}`
    }
    return Api().get(url)
  },

  addFeaturedMatch (params: { VideoUrl: string; CreatorId?: string; GameIds?: string[] }) {
    return Api().post('/featured-matches', params)
  },

  removeFeaturedMatch (matchId: string) {
    return Api().delete(`/featured-matches/${matchId}`)
  },

  isFeaturedMatch (matchId: string) {
    return Api().get(`/featured-matches/${matchId}/status`)
  },
}