
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Tournaments
  getTournamentMatches (params: Params) {
    if(params.searchQuery) {
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      return Api().get('tournament-matches/' + params.id + '?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
    } else {
      return Api().get('tournament-matches/' + params.id)
    }

  },

  queryTournamentMatches (params: Params) {
    if(params.searchQuery) {
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      return Api().get('tournament-matches?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
    } else {
      return Api().get('tournament-matches/')
    }

  },

}