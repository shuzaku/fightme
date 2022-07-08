
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Characters
  fetchCharacters () {
    return Api().get('characters')
  },

  addCharacter (params: Params) {
    return Api().post('characters', params)
  },

  addBulkCharacters (params: Params) {
    return Api().post('characters?bulk=true', params)
  },

  queryCharacters (params: Params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName}); 
    var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
    return Api().get('characterQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },

  updateCharacter (params: Params) {
    return Api().put('characters/' + params.id, params)
  },

  getCharacter (params: Params) {
    return Api().get('characters/' + params.id) 
  },

  getCharacterBySlug (params: Params) {
    return Api().get('characterSlug/' + params.slug) 
  },

  deleteCharacter (id: string) {
    return Api().delete('characters/' + id)
  },

  queryMatchup(params: Params) {
    return Api().get(`characterMatchupInfo?character1=${params.searchQuery[0].characters.character1}&character2=${params.searchQuery[0].characters.character2}`)
  }
}