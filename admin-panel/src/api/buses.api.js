import apiClient from './client';

export async function getAllBuses(page = 1, limit = 20) {
  const res = await apiClient.get(`/api/buses?page=${page}&limit=${limit}`);
  return res.data;
}

export async function createBus(data) {
  const res = await apiClient.post('/api/buses', data);
  return res.data;
}

export async function updateBus(busId, data) {
  const res = await apiClient.patch(`/api/buses/${busId}`, data);
  return res.data;
}

export async function deleteBus(busId) {
  const res = await apiClient.delete(`/api/buses/${busId}`);
  return res.data;
}