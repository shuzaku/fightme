import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Articles
  fetchArticles() {
    return Api().get('articles')
  },

  addArticle(params: Params) {
    return Api().post('articles', params)
  },

  updateArticle(params: Params) {
    return Api().put('articles/' + params.id, params)
  },

  getArticle() {
    return Api().get('articles/') 
  },

  deleteArticle(id: string) {
    return Api().delete('articles/' + id)
  },
} 