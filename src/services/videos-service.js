import Api from '@/services/Api'

export default {
  //Videos
  fetchVideos (params) {
    return Api().get('videos?skip='+ params, params)
  },

  addVideo (params) {
    return Api().post('video', params)
  },
  
  addVideos (params) {
    return Api().post('video?bulk=true', params)
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
    if(params.sortOption){
      queryParams.push(`sort=${params.sortOption}`)
    }
    if(params.filter){
      queryParams.push(`filter=${params.filter}`)
    }
    if(params.tagFilter){
      queryParams.push(`tag=${params.tagFilter}`)
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
  },

  bulkDeleteVideos() {
    return Api().post('bulkVideos/')
  },

  getVideos() {
    return Api().post('getVideos/')
  },

  getComboVideo (id) {
    return Api().get('comboVideo/' + id) 
  },

  getMatchVideo (url) {
    return Api().get('matchVideo/' + url) 
  },

  queryMatchup(params) {
    var skip = params.skip;
    return Api().get(`characterMatchup?character1=${params.searchQuery.character1}&character2=${params.searchQuery.character2}&skip=${skip}`, params)
  }
} 