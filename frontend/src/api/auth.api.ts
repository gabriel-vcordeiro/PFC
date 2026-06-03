import { api } from './axios';

//Caminhos auth
export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', {
    email,
    password,
  });

  return response.data;
}
export async function register(
  email: string,
  password: string,
  username: string,
  consentimento_aceito: boolean,
  consentimento_finalidade: string,
  consentimento_versao: string
) {
  const response = await api.post('/auth/register', {
    email,
    password,
    username,
    consentimento_aceito,
    consentimento_finalidade,
    consentimento_versao,
  });
  return response.data;
}

export async function requestPasswordReset(email: string) {
  const response = await api.post('/auth/request-password-reset', { email });
  return response.data;
}

export async function validateResetToken(resetToken: string) {
  const response = await api.post('/auth/validate-reset-token', { resetToken });
  return response.data;
}

export async function resetPassword(resetToken: string, newPassword: string) {
  const response = await api.post('/auth/reset-password', { resetToken, newPassword });
  return response.data;
}

export async function verify2FA(token: string) {
  const response = await api.post('/auth/verify-2fa', {
    token,
  });
  return response.data;
}

export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

export async function enable2FA() {
  const response = await api.post('/auth/enable-2fa');
  return response.data;
}

export async function disable2FA() {
  const response = await api.post('/auth/disable-2fa');
  return response.data;
}

export async function getUser() {
  const response = await api.get('/user/user');
  return response.data;
}

export async function exportUserData() {
  const response = await api.get('/user/export-user-data');
  return response.data;
}

export async function deleteUserData() {
  const response = await api.post('/user/delete-user-data');
  return response.data;
}
