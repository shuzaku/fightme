
import Api from '@/services/Api'

export default {
  addMatch(params) {
    return Api().post('matches', params)
  },

  addMatches(params) {
    return Api().post('matches?bulk=true', params)
  },

  fetchMatches() {
    return Api().get('matches')
  },

  patchMatch(params) {
    return Api().put('matches/' + params.id, params)
  },

  getMatch(params) {
    return Api().get('match/' + params) 
  },

  getMatches(params) {
    return Api().get('matches/' + params) 
  },

  deleteMatch(id) {
    return Api().delete('match/' + id)
  },

  queryMatches (params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName}); 
    var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
    return Api().get('matchQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','), params)
  },

  patchMatches(params) {
    return Api().put('matches/', params)
  },
} 