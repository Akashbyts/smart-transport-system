const express = require('express');
const router = express.Router();
const controller = require('./passenger.controller');
const { authenticate } = require('../../middleware/auth');

const passengerAuth = authenticate(['passenger']);

router.get('/profile', passengerAuth, controller.getProfile);
router.get('/nearby-buses', passengerAuth, controller.getNearbyBuses);
router.get('/search-routes', passengerAuth, controller.searchRoutes);
router.get('/bus/:busId/location', passengerAuth, controller.getBusLocation);
router.get('/bus/:busId/details', passengerAuth, controller.getBusDetails);

module.exports = router;