
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Updates
  fetchUpdates () {
    return Api().get('updates')
  },

  addUpdate (params: Params) {
    return Api().post('updates', params)
  },

  queryUpdates (params: Params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName}); 
    var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
    return Api().get('updateQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },

  updateUpdate (params: Params) {
    return Api().put('updates/' + params.id, params)
  },

  getUpdate (params: Params) {
    return Api().get('updates/' + params.id) 
  },

  deleteUpdate (id: string) {
    return Api().delete('updates/' + id)
  }
}