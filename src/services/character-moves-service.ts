import Api from '@/services/Api'

export interface CharacterMove {
  _id: string
  CharacterId: string
  MoveName: string
  ImageUrl?: string
  Slug?: string
  WikiSourceUrl?: string
  DisplayOrder?: number
}

export default {
  getMovesForCharacter(characterId: string) {
    return Api().get(`character-moves/${encodeURIComponent(characterId)}`)
  },

  getGamesWithMoves() {
    return Api().get('character-moves/games')
  },

  bulkUpsert(characterId: string, moves: Array<{ moveName: string; imageUrl?: string; wikiSourceUrl?: string; displayOrder?: number }>) {
    return Api().post('character-moves/bulk', { characterId, moves })
  },

  deleteMove(moveId: string) {
    return Api().delete(`character-moves/${moveId}`)
  },
}
