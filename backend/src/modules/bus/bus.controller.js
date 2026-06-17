const busService = require('./bus.service');
const { successResponse, paginatedResponse } = require('../../utils/response');

async function createBus(req, res, next) {
  try {
    const bus = await busService.createBus(req.body);
    return successResponse(res, { bus }, 'Bus created', 201);
  } catch (error) { next(error); }
}

async function getAllBuses(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const { buses, total } = await busService.getAllBuses(limit, (page - 1) * limit);
    return paginatedResponse(res, buses, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
}

async function updateBus(req, res, next) {
  try {
    const bus = await busService.updateBus(req.params.busId, req.body);
    return successResponse(res, { bus }, 'Bus updated');
  } catch (error) { next(error); }
}

async function deleteBus(req, res, next) {
  try {
    await busService.deleteBus(req.params.busId);
    return successResponse(res, {}, 'Bus deactivated');
  } catch (error) { next(error); }
}

module.exports = { createBus, getAllBuses, updateBus, deleteBus };