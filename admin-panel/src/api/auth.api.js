import apiClient from './client';

export async function adminLogin(email, password) {
  const res = await apiClient.post('/api/auth/admin/login', { email, password });
  return res.data;
}

export async function adminLogout() {
  const res = await apiClient.post('/api/auth/logout');
  return res.data;
}

export async function createAdmin(data) {
  const res = await apiClient.post('/api/admin/admins', data);
  return res.data;
}

export async function getAllAdmins() {
  const res = await apiClient.get('/api/admin/admins');
  return res.data;
}