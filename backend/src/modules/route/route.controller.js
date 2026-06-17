const routeService = require('./route.service');
const { successResponse, paginatedResponse } = require('../../utils/response');

async function createRoute(req, res, next) {
  try {
    const route = await routeService.createRoute(req.body);
    return successResponse(res, { route }, 'Route created', 201);
  } catch (error) { next(error); }
}

async function getAllRoutes(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const { routes, total } = await routeService.getAllRoutes(limit, (page - 1) * limit);
    return paginatedResponse(res, routes, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
}

async function getRouteById(req, res, next) {
  try {
    const route = await routeService.getRouteById(req.params.routeId);
    return successResponse(res, { route });
  } catch (error) { next(error); }
}

async function updateRoute(req, res, next) {
  try {
    const route = await routeService.updateRoute(req.params.routeId, req.body);
    return successResponse(res, { route }, 'Route updated');
  } catch (error) { next(error); }
}

module.exports = { createRoute, getAllRoutes, getRouteById, updateRoute };