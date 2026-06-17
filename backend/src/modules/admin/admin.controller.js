const adminService = require('./admin.service');
const { successResponse, paginatedResponse } = require('../../utils/response');

async function getDashboard(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    return successResponse(res, { stats });
  } catch (error) { next(error); }
}

async function getPendingDrivers(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const { drivers, total } = await adminService.getPendingDrivers(limit, (page - 1) * limit);
    return paginatedResponse(res, drivers, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
}

async function approveDriver(req, res, next) {
  try {
    const driver = await adminService.approveDriver(req.params.driverId);
    return successResponse(res, { driver }, 'Driver approved');
  } catch (error) { next(error); }
}

async function rejectDriver(req, res, next) {
  try {
    const { reason } = req.body;
    const driver = await adminService.rejectDriver(req.params.driverId, reason);
    return successResponse(res, { driver }, 'Driver rejected');
  } catch (error) { next(error); }
}

async function getAllDrivers(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const { drivers, total } = await adminService.getAllDrivers(
      limit, (page - 1) * limit, req.query.status
    );
    return paginatedResponse(res, drivers, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
}

async function getAllTrips(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const { trips, total } = await adminService.getAllTrips(limit, (page - 1) * limit);
    return paginatedResponse(res, trips, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
}

async function createAdmin(req, res, next) {
  try {
    const admin = await adminService.createAdmin(req.body);
    return successResponse(res, { admin }, 'Admin created successfully', 201);
  } catch (error) { next(error); }
}

async function getAllAdmins(req, res, next) {
  try {
    const admins = await adminService.getAllAdmins();
    return successResponse(res, admins);
  } catch (error) { next(error); }
}

module.exports = {
  getDashboard, getPendingDrivers, approveDriver,
  rejectDriver, getAllDrivers, getAllTrips,
  createAdmin, getAllAdmins
};