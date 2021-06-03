
import Api from '@/services/Api'

export default {
  addMatch(params) {
    return Api().post('matches', params)
  },

  fetchMatches() {
    return Api().get('matches')
  },
} 