import apiClient from './client';


export async function getAllDrivers(page = 1, limit = 20, status = '') {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);
  const res = await apiClient.get('/api/admin/drivers?' + params.toString());
  return res.data;
}

export async function getPendingDrivers(page = 1, limit = 20) {
  const res = await apiClient.get(
    '/api/admin/drivers/pending?page=' + page + '&limit=' + limit
  );
  return res.data;
}

export async function approveDriver(driverId) {
  const res = await apiClient.patch('/api/admin/drivers/' + driverId + '/approve');
  return res.data;
}

export async function rejectDriver(driverId, reason) {
  const res = await apiClient.patch(
    '/api/admin/drivers/' + driverId + '/reject',
    { reason }
  );
  return res.data;
}
