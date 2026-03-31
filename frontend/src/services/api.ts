import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const shouldSkipRedirect =
      error.config?.headers?.['X-Skip-Auth-Redirect'] === 'true' ||
      error.config?.headers?.['x-skip-auth-redirect'] === 'true';

    if (error.response?.status === 401 && !shouldSkipRedirect && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);

export default api;
