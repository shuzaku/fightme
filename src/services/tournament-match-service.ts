
import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Tournaments
  getTournamentMatches (params: Params) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    var tournamentId = params.id;
    if(params.searchQuery) {
      var queryNames = params.searchQuery.map(param => { return param.queryName}); 
      var queryValue = params.searchQuery.map(param => { return param.queryValue}); 
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    } 
    return Api().get(`tournament-matches/${tournamentId}?${queryParams.join('&')}`)


  },

  queryTournamentMatches (params: Params & { pointChar?: string }) {
    var skip = params.skip;
    var queryParams = [`skip=${skip}`];
    if(params.searchQuery) {
      var queryNames = params.searchQuery.map(param => { return param.queryName});
      var queryValue = params.searchQuery.map(param => { return param.queryValue});
      queryParams.push(`queryName=${queryNames.join(',')}`);
      queryParams.push(`queryValue=${queryValue.join(',')}`)
    }
    // Narrow to matches where this character was played on point (listed first).
    if (params.pointChar) queryParams.push(`pointChar=${params.pointChar}`);

    return Api().get(`/tournament-matches?${queryParams.join('&')}`)
  },

  getTournamentMatchById(id: string) {
    var enc = encodeURIComponent(id)
    return Api().get(`/tournament-matches?skip=0&queryName=Id&queryValue=${enc}`)
  },

  updateTournamentMatch(id: string, body: Record<string, unknown>) {
    return Api().put(`tournament-matches/${encodeURIComponent(id)}`, body)
  },

  bulkInsertTournamentMatches(matches: any[]) {
    return Api().post('tournament-matches/bulk', { matches })
  },

}