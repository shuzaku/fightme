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
    var queryNames = params.map(param => { return param.queryName}); 
    var queryValue = params.map(param => { return param.queryValue}); 
    return Api().get('videoQuery?queryName=' + queryNames.join(',') + '&queryValue=' + queryValue.join(','), params)
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