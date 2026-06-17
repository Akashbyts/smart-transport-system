const driverService = require('./driver.service');
const { successResponse, paginatedResponse } = require('../../utils/response');

async function getProfile(req, res, next) {
  try {
    const profile = await driverService.getDriverProfile(req.user.id);
    return successResponse(res, { profile });
  } catch (error) { next(error); }
}

async function submitKYC(req, res, next) {
  try {
    const result = await driverService.submitKYC(req.user.id, req.body, req.files);
    return successResponse(res, result, 'KYC submitted successfully');
  } catch (error) { next(error); }
}

async function getTrips(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const { trips, total } = await driverService.getDriverTrips(req.user.id, limit, offset);
    return paginatedResponse(res, trips, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await driverService.updateProfile(req.user.id, req.body);
    return successResponse(res, { profile }, 'Profile updated');
  } catch (error) { next(error); }
}

module.exports = { getProfile, submitKYC, getTrips, updateProfile };