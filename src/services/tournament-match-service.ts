
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Tournaments
  getTournamentMatches (params: Params) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    var tournamentId = params.id;
    console.log(params)
    if(params.searchQuery) {
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    } 
    return Api().get(`tournament-matches/${tournamentId}?${queryParams.join('&')}`)


  },

  queryTournamentMatches (params: Params) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    if(params.searchQuery) {
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    } 

    return Api().get(`tournament-matches/?${queryParams.join('&')}`)
  },

}