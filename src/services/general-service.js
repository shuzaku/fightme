
import Api from '@/services/Api'

export default {
  //Search
  fetchForSearch() {
    return Api().get('search')
  },
} 