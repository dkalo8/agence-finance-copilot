import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? '/api/v1'
    : 'http://localhost:5000/api/v1');

const api = axios.create({ baseURL });

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
