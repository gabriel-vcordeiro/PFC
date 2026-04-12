import { api } from './axios';

export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', {
    email,
    password
  });

  return response.data;
}

export async function register(email: string, password: string) {
  const response = await api.post('/auth/register', {
    email,
    password
  });

  return response.data;
}

export async function verify2FA(userId: string, token: string) {
  const response = await api.post('/auth/verify-2fa', {
    userId,
    token
  });

  return response.data;
}

export async function enable2FA(userId: string) {
  const response = await api.post('/auth/enable-2fa', {
    userId
  });

  return response.data;
}

export async function disable2FA(userId: string) {
  const response = await api.post('/auth/disable-2fa', {
    userId
  });

  return response.data;
}