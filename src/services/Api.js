import axios from 'axios'

export default() => {
    return axios.create({
        baseURL: 'https://fightme-server.herokuapp.com/'
        // baseURL: 'http://localhost:8082'
    })
}