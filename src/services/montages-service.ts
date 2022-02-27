
import Api from '@/services/Api'

export default {
  addMontage(params) {
    return Api().post('montages', params)
  },
  getMontage(params) {
    return Api().get('montage/' + params) 
  },
} 