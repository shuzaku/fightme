
import Api from '@/services/Api'

export default {
  //Games
  fetchGames () {
    return Api().get('games')
  },

  addGame (params) {
    return Api().post('games', params)
  },

  queryGames (params) {
    var queryNames = params.map(param => { return param.queryName}); 
    var queryValue = params.map(param => { return param.queryValue}); 
    return Api().get('gameQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','), params)
  },

  updateGame (params) {
    return Api().put('games/' + params.id, params)
  },

  getGame (params) {
    return Api().get('games/' + params.id) 
  },

  deleteGame (id) {
    return Api().delete('games/' + id)
  }
}