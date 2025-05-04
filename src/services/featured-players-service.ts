
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Tournaments
  fetchFeaturedPlayers () {
    return Api().get('featuredPlayers')
  },
}