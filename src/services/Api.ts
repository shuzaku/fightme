import axios from 'axios'

export default() => {
    const instance = axios.create({
        baseURL: 'http://node-fightersedge-env.eba-wc4jpjyb.us-east-2.elasticbeanstalk.com/
        // baseURL: 'http://localhost:80'
    })

    // Add request interceptor to include auth token
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Add response interceptor to handle auth errors
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                // Token expired or invalid, clear auth data
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                // Optionally redirect to login page
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return instance;
}