import apiClient from './client';

export async function startTrip(busId, routeId) {
  const res = await apiClient.post('/api/trips/start', {
    bus_id: busId,
    route_id: routeId
  });
  return res.data;
}

export async function endTrip(tripId) {
  const res = await apiClient.patch(`/api/trips/${tripId}/end`);
  return res.data;
}

export async function sendLocation(locationData) {
  const res = await apiClient.post('/api/trips/location', locationData);
  return res.data;
}

export async function getActiveTrip() {
  const res = await apiClient.get('/api/trips/active');
  return res.data;
}

export async function getAllBuses() {
  const res = await apiClient.get('/api/buses');
  return res.data;
}

export async function getAllRoutes() {
  const res = await apiClient.get('/api/routes');
  return res.data;
}

export async function saveDrawnRoute(routeData) {
  const res = await apiClient.post('/api/routes', routeData);
  return res.data;
}