
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Games
  fetchGames () {
    return Api().get('games')
  },

  addGame (params: Params) {
    return Api().post('games', params)
  },

  queryGames (params: Params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName}); 
    var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
    return Api().get('gameQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },

  updateGame (params: Params) {
    return Api().put('games/' + params.id, params)
  },

  getGame (params: Params) {
    return Api().get('games/' + params.id) 
  },

  deleteGame (id: string) {
    return Api().delete('games/' + id)
  }
}