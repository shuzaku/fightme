
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Players
  fetchPlayers() {
    return Api().get('players')
  },

  addPlayer(params: Params) {
    return Api().post('player', params)
  },

  updatePlayer(params: Params) {
    return Api().put('players/' + params.id, params)
  },

  getPlayer(params: Params) {
    return Api().get('players/' + params.id) 
  },
  
  deletePlayer(id: string) {
    return Api().delete('players/' + id)
  },

  queryPlayers (params: Params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName}); 
    var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
    return Api().get('playerQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },
} 