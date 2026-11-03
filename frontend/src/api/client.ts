import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.DEV ? 'http://localhost:8080' : '');

const client = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add JWT token to headers and handle FormData properly
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData uploads, remove Content-Type so browser sets multipart/form-data with boundary
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    } else if (config.headers && !config.headers['Content-Type'] && !config.headers['content-type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if on protected page
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
export { API_BASE_URL };
