
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  addMatch(params: Params) {
    return Api().post('matches', params)
  },

  addMatches(params: Params) {
    return Api().post('matches?bulk=true', params)
  },

  fetchMatches() {
    return Api().get('matches')
  },

  patchMatch(params: Params) {
    return Api().put('matches/' + params.id, params)
  },

  getMatch(params: Params) {
    return Api().get('match/' + params) 
  },

  getMatches(params: Params) {
    return Api().get('matches/' + params) 
  },

  deleteMatch(id: string) {
    return Api().delete('match/' + id)
  },

  queryMatches (params: Params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName}); 
    var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
    return Api().get('matchQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },

  patchMatches(params: Params) {
    return Api().put('matches/', params)
  },

  queryMatchesByCharacter(params: Params){
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    if(params.searchQuery){
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }

    return Api().get(`/matchesCharacter?${queryParams.join('&')}`)
  },

  queryMatchesByPlayer(params: Params){
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    if(params.searchQuery){
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }

    return Api().get(`/matchesPlayer?${queryParams.join('&')}`)
  },

  queryMatchesByGame(params: Params){
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    if(params.searchQuery){
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }

    return Api().get(`/matchesGame?${queryParams.join('&')}`)
  },
} 