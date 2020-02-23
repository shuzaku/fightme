
import Api from '@/services/Api'

export default {
  //Games
  fetchGames () {
    return Api().get('games')
  },

  addGame (params) {
    return Api().post('games', params)
  },

  updateGame (params) {
    return Api().put('games/' + params.id, params)
  },

  getGame (params) {
    return Api().get('games/' + params.id) 
  },

  deleteGame (id) {
    return Api().delete('games/' + id)
  },
  //Players
  fetchPlayers () {
    return Api().get('players')
  },

  addPlayers (params) {
    return Api().post('players', params)
  },

  updatePlayers(params) {
    return Api().put('players/' + params.id, params)
  },

  getPlayers (params) {
    return Api().get('players/' + params.id) 
  },

  deletePlayers (id) {
    return Api().delete('players/' + id)
  }
} 