import axios from 'axios'

export default() => {
    return axios.create({
        baseURL: 'https://fighters-edge-server.herokuapp.com/'
    })
}