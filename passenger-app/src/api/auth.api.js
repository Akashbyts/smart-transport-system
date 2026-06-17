import apiClient from './client';

export const sendOTP = (phone) =>
  apiClient.post('/api/auth/otp/send', { phone }).then(r => r.data);

export const verifyOTP = (phone, otp) =>
  apiClient.post('/api/auth/otp/verify', { phone, otp }).then(r => r.data);

export const registerPassenger = (data) =>
  apiClient.post('/api/auth/passenger/register', data).then(r => r.data);

export const loginPassenger = (phone, password) =>
  apiClient.post('/api/auth/passenger/login', { phone, password }).then(r => r.data);

export const logoutPassenger = () =>
  apiClient.post('/api/auth/logout').then(r => r.data);