import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  fetchMatchNotes() {
    return Api().get('match-notes')
  },

  addMatchNote(params: Params) {
    return Api().post('match-notes', params)
  },

  queryMatchNotes(params: Params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName }); 
    var queryValue = params.searchQuery.map(param => { return param.queryValue }); 
    return Api().get('match-note-query?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },

  updateMatchNote(params: Params) {
    return Api().put('match-notes/' + params.id, params)
  },

  getMatchNote(params: Params) {
    return Api().get('match-notes/' + params.id) 
  },

  deleteMatchNote(id: string) {
    return Api().delete('match-notes/' + id)
  },

  toggleLikeMatchNote(id: string, userId: string) {
    return Api().post('match-notes/' + id + '/like', { UserId: userId })
  },

  reportMatchNote(id: string, userId: string) {
    return Api().post('match-notes/' + id + '/report', { UserId: userId })
  }
}

