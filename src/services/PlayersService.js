
import Api from '@/services/Api'

export default {
  //Players
  fetchPlayers() {
    return Api().get('players')
  },

  addPlayer(params) {
    return Api().post('players', params)
  },

  updatePlayer(params) {
    return Api().put('players/' + params.id, params)
  },

  getPlayer() {
    return Api().get('players/') 
  },

  findPlayer(params) {
    return Api().findOne('players/' + params) 
  },

  deletePlayer(id) {
    return Api().delete('players/' + id)
  },
} 