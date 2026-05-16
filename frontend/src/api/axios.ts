import axios from 'axios';
import { env } from '../config/env';

export const api = axios.create({
  baseURL: env.apiUrl
});

// envia token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRoute =
      err.config?.url?.includes('/auth/login');

    if (
      err.response?.status === 401 &&
      !isLoginRoute
    ) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }

    return Promise.reject(err);
  }
);