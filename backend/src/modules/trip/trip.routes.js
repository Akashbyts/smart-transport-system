const express = require('express');
const router = express.Router();
const controller = require('./trip.controller');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { locationRateLimiter } = require('../../middleware/rateLimiter');
const { startTripSchema, locationUpdateSchema } = require('./trip.validator');

const driverAuth = authenticate(['driver']);

router.post('/start', driverAuth, validate(startTripSchema), controller.startTrip);
router.patch('/:tripId/end', driverAuth, controller.endTrip);
router.post('/location', driverAuth, locationRateLimiter, validate(locationUpdateSchema), controller.updateLocation);
router.get('/active', driverAuth, controller.getActiveTrip);

module.exports = router;