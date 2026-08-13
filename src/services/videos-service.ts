import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  validateVideo(params: Params) {
    return Api().post('video-validate', params)
  },

  queryMatchup(params: Params) {
    var skip = params.skip;
    return Api().get(`characterMatchup?character1=${params.searchQuery[0].characters.character1}&character2=${params.searchQuery[0].characters.character2}&skip=${skip}`)
  },

  querySlugMatchup(params: Params) {
    var skip = params.skip;
    return Api().get(`characterSlugMatchup?character1=${params.searchQuery[0].characters.character1}&character2=${params.searchQuery[0].characters.character2}&skip=${skip}`)
  },

  // Admin video approval methods (use video-validate collection, not videos)
  getPendingVideos(params: Params) {
    return Api().get('video-validate?skip=' + params.skip)
  },

  approveVideo(videoId: string) {
    return Api().post(`video-validate/approve/${videoId}`)
  },

  rejectVideo(videoId: string) {
    return Api().delete(`video-validate/${videoId}`)
  },

  updatePendingVideo(videoId: string, params: Params) {
    return Api().put(`video-validate/${videoId}`, params)
  },

  queryComboClips(params: Params) {
    var skip = params.skip || 0;
    var queryParams = [`skip=${skip}`];

    if (params.searchQuery && params.searchQuery.length > 0) {
      var queryName = params.searchQuery[0].queryName;
      var queryValue = params.searchQuery[0].queryValue;
      queryParams.push(`queryName=${queryName}`);
      queryParams.push(`queryValue=${queryValue}`);
    }

    return Api().get(`comboClipsQuery?${queryParams.join('&')}`)
  },
}
