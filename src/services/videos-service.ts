import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Videos
  fetchVideos(params: Params) {
    return Api().get('videos?skip=' + params.skip)
  },

  addVideo(params: Params) {
    return Api().post('video', params)
  },

  addVideos(params: Params) {
    return Api().post('video?bulk=true', params)
  },

  validateVideo(params: Params) {
    return Api().post('video-validate', params)
  },

  queryVideos(params: Params) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    if (params.searchQuery) {
      var queryNames = params.searchQuery.map(param => { return param.queryName });
      var queryValue = params.searchQuery.map(param => { return param.queryValue });
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }
    if (params.sort) {
      queryParams.push(`sort=${params.sort}`)
    }
    if (params.filter) {
      queryParams.push(`filter=${params.filter}`)
    }
    if (params.tagFilter) {
      queryParams.push(`tag=${params.tagFilter}`)
    }
    return Api().get(`videoQuery?${queryParams.join('&')}`)
  },

  queryVideosByCharacter(params: Params) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    if (params.searchQuery) {
      var queryNames = params.searchQuery.map(param => { return param.queryName });
      var queryValue = params.searchQuery.map(param => { return param.queryValue });
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }
    if (params.sort) {
      queryParams.push(`sort=${params.sort}`)
    }
    if (params.filter) {
      queryParams.push(`filter=${params.filter}`)
    }

    return Api().get(`videoCharacterQuery?${queryParams.join('&')}`)
  },

  queryVideosByPlayer(params: Params) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    if (params.searchQuery) {
      var queryNames = params.searchQuery.map(param => { return param.queryName });
      var queryValue = params.searchQuery.map(param => { return param.queryValue });
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }
    if (params.sort) {
      queryParams.push(`sort=${params.sort}`)
    }
    if (params.filter) {
      queryParams.push(`filter=${params.filter}`)
    }

    return Api().get(`videoPlayerQuery?${queryParams.join('&')}`)
  },

  queryVideosByGame(params: Params) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    if (params.searchQuery) {
      var queryNames = params.searchQuery.map(param => { return param.queryName });
      var queryValue = params.searchQuery.map(param => { return param.queryValue });
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }
    if (params.sort) {
      queryParams.push(`sort=${params.sort}`)
    }
    if (params.filter) {
      queryParams.push(`filter=${params.filter}`)
    }

    return Api().get(`videoGameQuery?${queryParams.join('&')}`)
  },

  patchVideo(params: Params) {
    return Api().put('video/' + params.id, params)
  },

  getVideo(id: string) {
    return Api().get('video/' + id)
  },

  deleteVideo(id: string) {
    return Api().delete('videos/' + id)
  },

  bulkDeleteVideos() {
    return Api().post('bulkVideos/')
  },

  getVideos() {
    return Api().post('getVideos/')
  },

  getComboVideo(id: string) {
    return Api().get('comboVideo/' + id)
  },

  getMatchVideo(url: string) {
    return Api().get('matchVideo/' + url)
  },

  queryMatchup(params: Params) {
    var skip = params.skip;
    return Api().get(`characterMatchup?character1=${params.searchQuery[0].characters.character1}&character2=${params.searchQuery[0].characters.character2}&skip=${skip}`)
  },

  querySlugMatchup(params: Params) {
    var skip = params.skip;
    return Api().get(`characterSlugMatchup?character1=${params.searchQuery[0].characters.character1}&character2=${params.searchQuery[0].characters.character2}&skip=${skip}`)
  },

  // Admin video approval methods
  getPendingVideos(params: Params) {
    return Api().get('video-validate?skip=' + params.skip)
  },

  approveVideo(videoId: string) {
    return Api().post(`video-validate/approve/${videoId}`)
  },

  rejectVideo(videoId: string) {
    return Api().delete(`video-validate/${videoId}`)
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