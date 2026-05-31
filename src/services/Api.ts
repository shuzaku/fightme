import axios from 'axios'

/**
 * Resolves the API base URL to use for requests.
 * Exported so non-axios callers (e.g. `<video src>` builders that need an
 * absolute URL) can pick up the same fallback logic instead of reading
 * `process.env.VUE_APP_API_URL` directly — that value is baked in at build
 * time and is `http://localhost:...` in the repo's `.env`, which would
 * otherwise leak into production bundles.
 */
export function resolveApiBaseURL(): string {
    const envUrl = process.env.VUE_APP_API_URL
    const host = typeof window !== 'undefined' ? window.location.hostname : ''

    const isLiveSite =
        host === 'fighters-edge.com' ||
        host === 'www.fighters-edge.com'

    // Misconfigured production build (VUE_APP_API_URL was localhost at build time).
    if (
        isLiveSite &&
        envUrl &&
        /localhost|127\.0\.0\.1/.test(envUrl)
    ) {
        return `${window.location.origin}/api`
    }

    if (envUrl) {
        return envUrl
    }

    // Hosted app without env: assume API is reverse-proxied under /api on the same origin.
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `${window.location.origin}/api`
    }

    return 'https://fighters-edge.com/api'
}

export default () => {
    const instance = axios.create({
        baseURL: resolveApiBaseURL(),
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