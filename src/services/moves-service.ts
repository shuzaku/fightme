
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Moves
  getCharacterMoves (params: Params) {
    return Api().get('characterMoves/' + params.id) 
  },
}