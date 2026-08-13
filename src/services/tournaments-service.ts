
import Api from '@/services/Api'
import Params from '@/types/params'

export interface TournamentSearchFilters {
  game?: string,
  tier?: string,
  location?: string,
  search?: string,
  isFinished?: boolean | string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string,
  page?: number,
  limit?: number
}

export default {
  //Tournaments
  fetchTournaments () {
    return Api().get('tournaments')
  },

  fetchCompeltedTournaments () {
    return Api().get('completed-tournaments')
  },

  addTournament (params: Params) {
    return Api().post('tournaments', params)
  },

  queryTournaments (params: Params) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    
    if(params.searchQuery){
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }

    if(params.sort){
      queryParams.push(`sort=${params.sort}`)
    }

    return Api().get(`tournamentQuery?${queryParams.join('&')}`)
  },

  updateTournament (params: Params) {
    return Api().put('tournaments/' + params.id, params)
  },

  getTournament (params: Params) {
    return Api().get('tournaments/' + params.id) 
  },

  deleteTournament (id: string) {
    return Api().delete('tournaments/' + id)
  },

  searchTournaments (filters: TournamentSearchFilters) {
    const queryParams: string[] = []

    Object.keys(filters || {}).forEach((key) => {
      const value = (filters as any)[key]
      if (value !== undefined && value !== null && value !== '') {
        queryParams.push(`${key}=${encodeURIComponent(value)}`)
      }
    })

    return Api().get(`tournamentSearch?${queryParams.join('&')}`)
  },

  getTournamentResults (id: string, topN?: number) {
    const query = topN ? `?topN=${topN}` : ''
    return Api().get(`tournaments/${id}/results${query}`)
  }
}