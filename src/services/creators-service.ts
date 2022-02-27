
import Api from '@/services/Api'

export default {
  //Creators
  fetchCreators () {
    return Api().get('creators')
  },

  addCreator (params) {
    return Api().post('creator', params)
  },

  queryCreators (params) {
    var queryNames = params.map(param => { return param.queryName}); 
    var queryValue = params.map(param => { return param.queryValue}); 
    return Api().get('creatorQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','), params)
  },

  updateCreator (params) {
    return Api().put('creators/' + params.id, params)
  },

  getCreator (params) {
    return Api().get('creators/' + params.id) 
  },

  deleteCreator (id) {
    return Api().delete('creators/' + id)
  }
}