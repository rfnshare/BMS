// logic/services/apiClient.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_URL.endsWith('/') ? API_URL : API_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// attach access token if exists
api.interceptors.request.use(cfg => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
  if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
