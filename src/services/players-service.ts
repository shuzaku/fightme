
import Api from '@/services/Api'
import Params from '@/types/params'
import MergePlayers from '@/types/merge-players'

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

  getPlayerBySlug (params: Params) {
    return Api().get('playerSlug/' + params.slug) 
  },

  mergePlayers (params: MergePlayers) {
    return Api().get(`/mergePlayers/${params.player1Id}/${params.player2Id}`) 
  },

  /**
   * Binds a player to a user. Server sets `AccountId` on the player and adds
   * the id to the account’s `LinkedPlayerIds` (array). Only `updatePlayer` is
   * required; no separate account patch.
   */
  linkPlayerToUser(playerId, accountId) {
    return this.updatePlayer(
      { id: playerId, AccountId: accountId }
    )
  },

  /** Unlinks; server removes the id from the account’s `LinkedPlayerIds`. */
  unlinkPlayerFromUser(playerId) {
    return this.updatePlayer(
      { id: playerId, AccountId: null }
    )
  },
} 