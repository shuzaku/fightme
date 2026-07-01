import Api from '@/services/Api'

export interface GameplanNode {
  id: string
  type?: 'comment' | 'input' | 'move'
  moveId?: string
  moveName?: string
  notation?: string
  label?: string
  imageUrl?: string
  player?: number
  text?: string
  color?: string
  x: number
  y: number
  note?: string
}

export interface GameplanEdge {
  id: string
  fromNodeId: string
  toNodeId: string
  label?: string
  style?: string
}

export interface Viewport {
  scale: number
  offsetX: number
  offsetY: number
}

export interface Gameplan {
  _id?: string
  Name: string
  CharacterId: string
  GameId?: string
  OwnerId: string
  Nodes: GameplanNode[]
  Edges: GameplanEdge[]
  Viewport?: Viewport
  IsPublic?: boolean
  updatedAt?: string
}

export default {
  create(gameplan: Omit<Gameplan, '_id'>) {
    return Api().post('gameplans', gameplan)
  },

  list(params: { ownerId?: string; characterId?: string; gameId?: string; isPublic?: boolean }) {
    const qs = new URLSearchParams()
    if (params.ownerId) qs.set('ownerId', params.ownerId)
    if (params.characterId) qs.set('characterId', params.characterId)
    if (params.gameId) qs.set('gameId', params.gameId)
    if (params.isPublic) qs.set('isPublic', 'true')
    return Api().get(`gameplans?${qs.toString()}`)
  },

  get(id: string) {
    return Api().get(`gameplans/${id}`)
  },

  update(id: string, payload: Partial<Gameplan> & { OwnerId: string }) {
    return Api().put(`gameplans/${id}`, payload)
  },

  delete(id: string, ownerId: string) {
    return Api().delete(`gameplans/${id}`, { data: { OwnerId: ownerId } })
  },
}
