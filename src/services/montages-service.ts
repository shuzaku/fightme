
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  addMontage(params: Params) {
    return Api().post('montages', params)
  },
  getMontage(params: Params) {
    return Api().get('montage/' + params)
  },
  queryMontages(params: any) {
    var skip = (params && params.skip) || 0;
    var query = `skip=${skip}`;
    if (params && params.playerId) {
      query += `&playerId=${params.playerId}`;
    }
    if (params && params.characterId) {
      query += `&characterId=${encodeURIComponent(params.characterId)}`;
    }
    return Api().get(`montages?${query}`)
  },
}
