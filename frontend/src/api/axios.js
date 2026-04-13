// src/api/axios.js
// The single entry point for ALL HTTP requests to the backend.
// Every request automatically gets the JWT token attached.
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stagio_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server returns 401 (token expired/invalid) → send user to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('stagio_token');
      localStorage.removeItem('stagio_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;