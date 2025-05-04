
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Tournaments
  fetchTournaments () {
    return Api().get('tournaments')
  },

  fetchCompeltedTournaments () {
    return Api().get('completed-tournaments')
  },

  addTournament (params: Params) {
    return Api().post('tournaments', params)
  },

  queryTournaments (params: Params) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    
    if(params.searchQuery){
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }

    if(params.sortOption){
      queryParams.push(`sort=${params.sortOption}`)
    }

    return Api().get(`tournamentQuery?${queryParams.join('&')}`)
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