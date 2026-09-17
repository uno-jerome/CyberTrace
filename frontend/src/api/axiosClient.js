import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cybertrace_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = !!localStorage.getItem('cybertrace_token');
      if (hadToken && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('cybertrace_token');
        localStorage.removeItem('cybertrace_user');
        window.dispatchEvent(new Event('cybertrace:session_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export { axiosClient, axiosClient as apiClient };
export default axiosClient;
