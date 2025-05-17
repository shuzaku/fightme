
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  queryAnalysis(params: Params){
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      return Api().get('matchAnalysis?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','))
  },
} 