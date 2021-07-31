
import Api from '@/services/Api'

export default {
  //Collections
  addCollection (params) {
    return Api().post('collections', params)
  },

  queryCollections (params) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    if(params.searchQuery){
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }
    return Api().get(`collectionQuery?${queryParams.join('&')}`, params)
  },

  queryCollection (id) {
    return Api().get('collection/' + id) 
  },

  updateCollection (params) {
    return Api().put('collections/' + params.id, params)
  },
}