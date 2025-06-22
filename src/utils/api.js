import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Use relative path for Vite proxy
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Log the base URL for debugging
console.log(`API requests will be proxied to backend through Vite`);

export default api;