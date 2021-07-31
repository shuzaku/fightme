
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
} 