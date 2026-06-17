const express = require('express');
const router = express.Router();
const controller = require('./route.controller');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { createRouteSchema, updateRouteSchema } = require('./route.validator');

const adminAuth = authenticate(['admin']);
const anyAuth = authenticate(['admin', 'driver', 'passenger']);

router.post('/', adminAuth, validate(createRouteSchema), controller.createRoute);
router.get('/', anyAuth, controller.getAllRoutes);
router.get('/:routeId', anyAuth, controller.getRouteById);
router.patch('/:routeId', adminAuth, validate(updateRouteSchema), controller.updateRoute);

module.exports = router;