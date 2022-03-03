import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Tags
  fetchTags() {
    return Api().get('tags')
  },

  addTag(params: Params) {
    return Api().post('tags', params)
  },

  updateTag(params: Params) {
    return Api().put('tags/' + params.id, params)
  },

  getTag() {
    return Api().get('tags/') 
  },

  deleteTag(id: string) {
    return Api().delete('tags/' + id)
  },
} 