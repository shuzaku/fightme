
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Tournaments
  fetchTournaments () {
    return Api().get('tournaments')
  },

  addTournament (params: Params) {
    return Api().post('tournaments', params)
  },

  queryTournaments (params: Params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName}); 
    var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
    return Api().get('tournamentQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },

  updateTournament (params: Params) {
    return Api().put('tournaments/' + params.id, params)
  },

  getTournament (params: Params) {
    return Api().get('tournaments/' + params.id) 
  },

  deleteTournament (id: string) {
    return Api().delete('tournaments/' + id)
  }
}