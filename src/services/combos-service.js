import Api from '@/services/Api'

export default {
  //Combos
  fetchCombos() {
    return Api().get('combos')
  },

  addCombo(params) {
    return Api().post('combos', params)
  },

  patchCombo(params) {
    return Api().put('combo/' + params.id, params)
  },

  getCombo() {
    return Api().get('combos/') 
  },

  findCombo(params) {
    return Api().findOne('combos/' + params) 
  },

  deleteCombo(id) {
    return Api().delete('combos/' + id)
  },
} 