
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Search
  fetchForSearch() {
    return Api().get('initialSearch')
  },

  search(params: Params) {
    console.log(params)
    return Api().get(`search?value=${params.searchQuery[0].queryValue}`)
  }
} 