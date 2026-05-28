
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  fetchMatchLogs () {
    return Api().get('matchLogs')
  },

  addMatchLog (params: any) {
    return Api().post('matchLogs', params)
  },

  queryMatchLogs (params: Params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName })
    var queryValue = params.searchQuery.map(param => { return param.queryValue })
    return Api().get('matchLogQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },

  updateMatchLog (params: any) {
    return Api().put('matchLogs/' + params.id, params)
  },

  getMatchLog (params: Params) {
    return Api().get('matchLogs/' + params.id)
  },

  deleteMatchLog (id: string) {
    return Api().delete('matchLogs/' + id)
  },

  createMatchFromLog (params: any) {
    return Api().post('matchLogMatch', params)
  },
}
