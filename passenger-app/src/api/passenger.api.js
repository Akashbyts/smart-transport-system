import apiClient from './client';

export const getProfile = () =>
  apiClient.get('/api/passengers/profile').then(r => r.data);

export const getNearbyBuses = (latitude, longitude, radius = 3) =>
  apiClient.get('/api/passengers/nearby-buses', {
    params: { latitude, longitude, radius }
  }).then(r => r.data);

export const getBusDetails = (busId) =>
  apiClient.get('/api/passengers/bus/' + busId + '/details').then(r => r.data);

export const getBusLocation = (busId) =>
  apiClient.get('/api/passengers/bus/' + busId + '/location').then(r => r.data);

export const searchRoutes = (q) =>
  apiClient.get('/api/passengers/search-routes', { params: { q } }).then(r => r.data);

export const getAllRoutes = () =>
  apiClient.get('/api/routes').then(r => r.data);

export const getRouteById = (routeId) =>
  apiClient.get('/api/routes/' + routeId).then(r => r.data);