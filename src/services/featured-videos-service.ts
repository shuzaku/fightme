
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Featured Videos
  fetchFeaturedVideos (params: Params & { GameId?: string, Type?: string }) {
    var url='/featured-video'
    if (params){
      const queryParams: string[] = []
      if (params.limit) queryParams.push(`limit=${params.limit}`)
      if (params.sort) queryParams.push(`sort=${params.sort}`)
      if (params.sortDirection) queryParams.push(`sortDirection=${params.sortDirection}`)
      if (params.GameId) queryParams.push(`GameId=${params.GameId}`)
      if (params.Type) queryParams.push(`Type=${params.Type}`)
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`
      }
    }
    return Api().get(url)
  },

  addFeaturedVideo (params: { VideoUrl: string, CreatorId?: string, GameIds?: string[], Type: string }) {
    return Api().post('/featured-video', params)
  },
}