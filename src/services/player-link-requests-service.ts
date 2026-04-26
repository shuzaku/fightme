import Api from '@/services/Api'

export default {
  getRequestForPlayer(accountId: string, playerId: string) {
    return Api().get('player-link-requests', {
      params: { accountId, playerId },
    })
  },

  createRequest(accountId: string, playerId: string) {
    return Api().post('player-link-requests', {
      AccountId: accountId,
      PlayerId: playerId,
    })
  },

  cancelRequest(requestId: string, accountId: string) {
    return Api().delete('player-link-requests/' + requestId, {
      params: { accountId },
    })
  },

  listPending() {
    return Api().get('player-link-requests', { params: { status: 'pending' } })
  },

  approveRequest(requestId: string) {
    return Api().put('player-link-requests/' + requestId + '/approve')
  },

  rejectRequest(requestId: string, note?: string) {
    return Api().put('player-link-requests/' + requestId + '/reject', {
      RejectionNote: note || 'Rejected by admin',
    })
  },
}
