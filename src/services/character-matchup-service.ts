
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  queryCharacterMatchup(params: Params) {
    return Api().get(`characterMatchupStat?characterId=${params.searchQuery[0].characters.characterId}&opposingCharacterId=${params.searchQuery[0].characters.opposingCharacterId}`)
  },

  queryMatchup(params: Params) {
    var skip = params.skip;
    return Api().get(`characterMatchup?character1=${params.searchQuery[0].characters.character1}&character2=${params.searchQuery[0].characters.character2}&skip=${skip}`)
  },

  querySlugMatchup(params: Params) {
    var skip = params.skip;
    return Api().get(`characterSlugMatchup?character1=${params.searchQuery[0].characters.character1}&character2=${params.searchQuery[0].characters.character2}&skip=${skip}`)
  }
}