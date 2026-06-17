const passengerService = require('./passenger.service');
const { successResponse } = require('../../utils/response');

async function getProfile(req, res, next) {
  try {
    const profile = await passengerService.getPassengerProfile(req.user.id);
    return successResponse(res, { profile });
  } catch (error) { next(error); }
}

async function getNearbyBuses(req, res, next) {
  try {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'latitude and longitude required' });
    }
    const buses = await passengerService.getNearbyBusesForPassenger(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius) || 2
    );
    return successResponse(res, { buses, count: buses.length });
  } catch (error) { next(error); }
}

async function searchRoutes(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });
    const routes = await passengerService.searchRoutes(q);
    return successResponse(res, { routes });
  } catch (error) { next(error); }
}

async function getBusLocation(req, res, next) {
  try {
    const location = await passengerService.getLiveBusLocation(req.params.busId);
    return successResponse(res, { location });
  } catch (error) { next(error); }
}

async function getBusDetails(req, res, next) {
  try {
    const details = await passengerService.getBusDetails(req.params.busId);
    return successResponse(res, { bus: details });
  } catch (error) { next(error); }
}

module.exports = { getProfile, getNearbyBuses, searchRoutes, getBusLocation, getBusDetails };