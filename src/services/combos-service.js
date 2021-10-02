import Api from '@/services/Api'

export default {
  //Combos
  fetchCombos() {
    return Api().get('combos')
  },

  addCombo(params) {
    return Api().post('combos', params)
  },

  addBulkCombos (params) {
    return Api().post('combos?bulk=true', params)
  },

  patchCombo(params) {
    return Api().put('combo/' + params.id, params)
  },

  getCombo(params) {
    return Api().get('combo/' + params) 
  },

  findCombo(params) {
    return Api().findOne('combos/' + params) 
  },

  deleteCombo(id) {
    return Api().delete('combo/' + id)
  },
} 