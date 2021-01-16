import Api from '@/services/Api'

export default {
  //Videos
  fetchVideos (params) {
    return Api().get('videos?skip='+ params, params)
  },

  addVideo (params) {
    return Api().post('videos', params)
  },
  
  queryVideos (params) {
    var queryNames = params.searchQuery.map(param => { return param.queryName}); 
    var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
    var skip = params.skip;
    return Api().get(`videoQuery?queryName=${queryNames.join(',')}&queryValue=${queryValue.join(',')}&skip=${skip}`, params)
  },

  updateVideo (params) {
    return Api().put('videos/' + params.id, params)
  },

  getVideo (params) {
    return Api().get('videos/' + params.id) 
  },

  deleteVideo (id) {
    return Api().delete('videos/' + id)
  }
} 