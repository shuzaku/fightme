import axios from 'axios'

export default() => {
    return axios.create({
        baseURL: 'https://git.heroku.com/fightme-server.git'
    })
}