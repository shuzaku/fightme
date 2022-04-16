
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //s
  fetchNotes () {
    return Api().get('notes')
  },

  addNote (params: Params) {
    return Api().post('notes', params)
  },

  queryNotes (params: Params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName}); 
    var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
    return Api().get('noteQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },

  updateNote (params: Params) {
    return Api().put('notes/' + params.id, params)
  },

  getNote (params: Params) {
    return Api().get('notes/' + params.id) 
  },

  deleteNote (id: string) {
    return Api().delete('notes/' + id)
  }
}