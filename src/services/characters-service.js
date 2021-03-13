
import Api from '@/services/Api'

export default {
  //Characters
  fetchCharacters () {
    return Api().get('characters')
  },

  addCharacter (params) {
    return Api().post('characters', params)
  },

  addBulkCharacters (params) {
    return Api().post('characters?bulk=true', params)
  },

  queryCharacters (params) {
    var queryNames = params.map(param => { return param.queryName}); 
    var queryValue = params.map(param => { return param.queryValue}); 
    return Api().get('characterQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','), params)
  },

  updateCharacter (params) {
    return Api().put('characters/' + params.id, params)
  },

  getCharacter (params) {
    return Api().get('characters/' + params.id) 
  },

  deleteCharacter (id) {
    return Api().delete('characters/' + id)
  }
}