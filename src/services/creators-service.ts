
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Creators
  fetchCreators () {
    return Api().get('creators')
  },

  addCreator (params: Params) {
    return Api().post('creator', params)
  },

  queryCreators (params: Params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName}); 
    var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
    return Api().get('creatorQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },

  updateCreator (params: Params) {
    return Api().put('creators/' + params.id, params)
  },

  getCreator (params: Params) {
    return Api().get('creators/' + params.id) 
  },

  deleteCreator (id: string) {
    return Api().delete('creators/' + id)
  }
}