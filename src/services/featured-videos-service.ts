
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Tournaments
  fetchFeaturedVideos (params: Params) {
    var url='/featured-video'
    if (params){
      url += `?${params.limit ? `limit=${params.limit}` : ''}${params.sort ? `&sort=${params.sort}` : ''}${params.sortDirection ? `&sortDirection=${params.sortDirection}` : ''}`
    }
    return Api().get(url)
  },
}