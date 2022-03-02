
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Collections
  addCollection (params: Params) {
    return Api().post('collections', params)
  },

  queryCollections (params: Params) {
    var queryParams = [];
    if(params.searchQuery){
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }
    return Api().get(`collectionQuery?${queryParams.join('&')}`)
  },

  queryCollection (id: string) {
    return Api().get('collection/' + id) 
  },

  updateCollection (params: Params) {
    return Api().put('collections/' + params.id, params)
  },
}