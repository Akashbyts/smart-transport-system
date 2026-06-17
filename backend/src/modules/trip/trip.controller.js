const tripService = require('./trip.service');
const { successResponse } = require('../../utils/response');

async function startTrip(req, res, next) {
  try {
    const trip = await tripService.startTrip(req.user.id, req.body);
    return successResponse(res, { trip }, 'Trip started successfully', 201);
  } catch (error) { next(error); }
}

async function endTrip(req, res, next) {
  try {
    const result = await tripService.endTrip(req.user.id, req.params.tripId);
    return successResponse(res, result, 'Trip ended successfully');
  } catch (error) { next(error); }
}

async function updateLocation(req, res, next) {
  try {
    const location = await tripService.updateLocation(req.user.id, req.body);
    return successResponse(res, { location }, 'Location updated');
  } catch (error) { next(error); }
}

async function getActiveTrip(req, res, next) {
  try {
    const trip = await tripService.getActiveTripForDriver(req.user.id);
    return successResponse(res, { trip });
  } catch (error) { next(error); }
}

module.exports = { startTrip, endTrip, updateLocation, getActiveTrip };