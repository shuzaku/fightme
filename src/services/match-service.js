
import Api from '@/services/Api'

export default {
  addBulkMatches (params) {
    return Api().post('matches?bulk=true', params)
  },

  fetchMatches() {
    return Api().get('matches')
  },
} 