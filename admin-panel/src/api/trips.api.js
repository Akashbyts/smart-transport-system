import apiClient from './client';

export async function getAllTrips(page = 1, limit = 20) {
  const res = await apiClient.get(`/api/admin/trips?page=${page}&limit=${limit}`);
  return res.data;
}

export async function getDashboardStats() {
  const res = await apiClient.get('/api/admin/dashboard');
  return res.data;
}