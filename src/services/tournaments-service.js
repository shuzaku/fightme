
import Api from '@/services/Api'

export default {
  //Tournaments
  fetchTournaments () {
    return Api().get('tournaments')
  },

  addTournament (params) {
    return Api().post('tournaments', params)
  },

  queryTournaments (params) {
    var queryNames = params.map(param => { return param.queryName}); 
    var queryValue = params.map(param => { return param.queryValue}); 
    return Api().get('tournamentQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','), params)
  },

  updateTournament (params) {
    return Api().put('tournaments/' + params.id, params)
  },

  getTournament (params) {
    return Api().get('tournaments/' + params.id) 
  },

  deleteTournament (id) {
    return Api().delete('tournaments/' + id)
  }
}