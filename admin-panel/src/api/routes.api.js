import apiClient from './client';

export async function getAllRoutes(page = 1, limit = 50) {
  const res = await apiClient.get('/api/routes?page=' + page + '&limit=' + limit);
  return res.data;
}

export async function createRoute(data) {
  const res = await apiClient.post('/api/routes', data);
  return res.data;
}

export async function updateRoute(routeId, data) {
  const res = await apiClient.patch('/api/routes/' + routeId, data);
  return res.data;
}

export async function deleteRoute(routeId) {
  const res = await apiClient.patch('/api/routes/' + routeId, { is_active: false });
  return res.data;
}