import axios from 'axios';
import { env } from '../config/env';

export const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRoute = err.config?.url?.includes('/auth/login');
    const isSessionBootstrapRoute = err.config?.url?.includes('/user/user');

    if (err.response?.status === 401 && !isLoginRoute && !isSessionBootstrapRoute) {
      window.location.href = '/';
    }

    return Promise.reject(err);
  }
);