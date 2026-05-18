import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  addComboClip(params: Params) {
    return Api().post('comboClip', params)
  },

  patchComboClip(params: Params) {
    return Api().put('comboClip/' + params.id, params)
  },

  getComboClip(params: Params) {
    return Api().get('comboClip/' + params)
  },

  deleteComboClip(id: string) {
    return Api().delete('comboClip/' + id)
  },

  getTwitterVideo(tweetId: string) {
    return Api().get('twitter-video', { params: { tweetId } })
  },
}
