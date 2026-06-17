import apiClient from './client';

export async function sendOTP(phone) {
  const res = await apiClient.post('/api/auth/otp/send', { phone });
  return res.data;
}

export async function verifyOTP(phone, otp) {
  const res = await apiClient.post('/api/auth/otp/verify', { phone, otp });
  return res.data;
}

export async function registerDriver(data) {
  const res = await apiClient.post('/api/auth/driver/register', data);
  return res.data;
}

export async function loginDriver(phone, password) {
  const res = await apiClient.post('/api/auth/driver/login', { phone, password });
  return res.data;
}

export async function logoutDriver() {
  const res = await apiClient.post('/api/auth/logout');
  return res.data;
}