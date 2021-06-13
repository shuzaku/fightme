
import Api from '@/services/Api'

export default {
  addMatch(params) {
    return Api().post('matches', params)
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