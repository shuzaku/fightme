
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  queryCharacterMatchup(params: Params) {
    return Api().get(`characterMatchupStat?characterId=${params.searchQuery[0].characters.characterId}&opposingCharacterId=${params.searchQuery[0].characters.opposingCharacterId}`)
  }
}