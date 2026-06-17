import apiClient from './client';

export async function getDriverProfile() {
  const res = await apiClient.get('/api/drivers/profile');
  return res.data;
}

export async function updateDriverProfile(data) {
  const res = await apiClient.patch('/api/drivers/profile', data);
  return res.data;
}

export async function submitKYC(formData) {
  const res = await apiClient.post('/api/drivers/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function getDriverTrips(page = 1, limit = 20) {
  const res = await apiClient.get(`/api/drivers/trips?page=${page}&limit=${limit}`);
  return res.data;
}