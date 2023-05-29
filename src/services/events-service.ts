import Api from '@/services/Api'
import Params from '@/types/params'

export default {
  //Events
  fetchEvents() {
    return Api().get('events')
  },

  addEvent(params: Params) {
    return Api().post('events', params)
  },

  updateEvent(params: Params) {
    return Api().put('events/' + params.id, params)
  },

  getEvent() {
    return Api().get('events/') 
  },

  deleteEvent(id: string) {
    return Api().delete('events/' + id)
  },
} 