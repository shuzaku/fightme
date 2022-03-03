import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Accounts
  fetchAccounts() {
    return Api().get('accounts')
  },

  addAccount(params: Params) {
    return Api().post('accounts', params)
  },

  updateAccount(params: Params) {
    return Api().put('accounts/' + params.id, params)
  },

  getAccount(params: Params) {
    return Api().get('accounts/'  + params.id) 
  },

  deleteAccount(id: string) {
    return Api().delete('accounts/' + id)
  },

  patchAccount (params: Params) {
    return Api().put('accounts/' + params.id, params)
  }
} 