const express = require('express');
const router = express.Router();
const controller = require('./bus.controller');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { createBusSchema, updateBusSchema } = require('./bus.validator');

const adminAuth = authenticate(['admin']);

router.post('/', adminAuth, validate(createBusSchema), controller.createBus);
router.get('/', authenticate(['admin', 'driver', 'passenger']), controller.getAllBuses);
router.patch('/:busId', adminAuth, validate(updateBusSchema), controller.updateBus);
router.delete('/:busId', adminAuth, controller.deleteBus);

module.exports = router;