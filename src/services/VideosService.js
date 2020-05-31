import Api from '@/services/Api'

export default {
  //Videos
  fetchVideos () {
    return Api().get('videos')
  },

  addVideo (params) {
    return Api().post('videos', params)
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