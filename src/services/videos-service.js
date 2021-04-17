import Api from '@/services/Api'

export default {
  //Videos
  fetchVideos (params) {
    return Api().get('videos?skip='+ params, params)
  },

  addVideo (params) {
    return Api().post('video', params)
  },
  
  queryVideos (params) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    if(params.searchQuery){
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }
    return Api().get(`videoQuery?${queryParams.join('&')}`, params)
  },

  patchVideo (params) {
    return Api().put('video/' + params.id, params)
  },

  getVideo (id) {
    return Api().get('video/' + id) 
  },

  deleteVideo (id) {
    return Api().delete('videos/' + id)
  }
} 