import Api from '@/services/Api'

export default {
  //Accounts
  fetchAccounts() {
    return Api().get('accounts')
  },

  addAccount(params) {
    return Api().post('accounts', params)
  },

  updateAccount(params) {
    return Api().put('accounts/' + params.id, params)
  },

  getAccount(params) {
    return Api().get('accounts/'  + params.id) 
  },

  findAccount(params) {
    return Api().findOne('accounts/' + params) 
  },

  deleteAccount(id) {
    return Api().delete('accounts/' + id)
  },

  patchAccount (params) {
    return Api().put('accounts/' + params.id, params)
  },
} 