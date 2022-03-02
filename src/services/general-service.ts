
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Search
  fetchForSearch() {
    return Api().get('search')
  },
} 