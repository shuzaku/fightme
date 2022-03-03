import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Combos
  fetchCombos() {
    return Api().get('combos')
  },

  addCombo(params: Params) {
    return Api().post('combos', params)
  },

  addBulkCombos (params: Params) {
    return Api().post('combos?bulk=true', params)
  },

  patchCombo(params: Params) {
    return Api().put('combo/' + params.id, params)
  },

  getComboClip(params: Params) {
    return Api().get('comboClip/' + params) 
  },

  deleteCombo(id: string) {
    return Api().delete('combo/' + id)
  },
} 