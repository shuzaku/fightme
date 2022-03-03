
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  addMontage(params: Params) {
    return Api().post('montages', params)
  },
  getMontage(params: Params) {
    return Api().get('montage/' + params) 
  },
} 