import Api from '@/services/Api'

export default {
  //Tags
  fetchTags() {
    return Api().get('tags')
  },

  addTag(params) {
    return Api().post('tags', params)
  },

  updateTag(params) {
    return Api().put('tags/' + params.id, params)
  },

  getTag() {
    return Api().get('tags/') 
  },

  findTag(params) {
    return Api().findOne('tags/' + params) 
  },

  deleteTag(id) {
    return Api().delete('tags/' + id)
  },
} 