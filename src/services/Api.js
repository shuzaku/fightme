import axios from 'axios'

export default() => {
    return axios.create({
        baseURL: ' https://fightme-312602.uc.r.appspot.com'
        // baseURL: 'http://localhost:8082'
    })
}