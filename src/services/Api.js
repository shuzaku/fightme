import axios from 'axios'

export default() => {
    var optionAxios = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    return axios.create({
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        baseURL: 'https://fightme-312602.uc.r.appspot.com/'
    })
}