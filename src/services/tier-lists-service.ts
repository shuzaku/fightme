import Api from '@/services/Api'

export default {
    createTierList(params) {
        return Api().post('tier-lists', params)
    },

    getTierList(id) {
        return Api().get('tier-lists/' + id)
    },

    getTierLists() {
        return Api().get('tier-lists')
    },

    addView(id) {
        return Api().post('tier-lists/' + id + '/view')
    },

    likeTierList(id, userId) {
        return Api().post('tier-lists/' + id + '/like', { userId: userId })
    }
}
