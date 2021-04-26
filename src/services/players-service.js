
import Api from '@/services/Api'

export default {
  //Players
  fetchPlayers() {
    return Api().get('players')
  },

  addPlayer(params) {
    return Api().post('player', params)
  },

  updatePlayer(params) {
    return Api().put('players/' + params.id, params)
  },

  getPlayer(params) {
    return Api().get('players/' + params.id) 
  },
  
  deletePlayer(id) {
    return Api().delete('players/' + id)
  }
} 