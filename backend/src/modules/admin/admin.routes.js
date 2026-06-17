const express = require('express');
const router = express.Router();
const controller = require('./admin.controller');
const { authenticate } = require('../../middleware/auth');
const adminAuth = authenticate(['admin']);
const { createAdminSchema } = require('./admin.validator');
const { validate } = require('../../middleware/validate');

router.post('/admins', adminAuth, validate(createAdminSchema), controller.createAdmin);
router.get('/admins', adminAuth, controller.getAllAdmins);
router.get('/dashboard', adminAuth, controller.getDashboard);
router.get('/drivers', adminAuth, controller.getAllDrivers);
router.get('/drivers/pending', adminAuth, controller.getPendingDrivers);
router.patch('/drivers/:driverId/approve', adminAuth, controller.approveDriver);
router.patch('/drivers/:driverId/reject', adminAuth, controller.rejectDriver);
router.get('/trips', adminAuth, controller.getAllTrips);
router.get('/trips/:tripId/locations', adminAuth, async (req, res, next) => {
  try {
    const { query } = require('../../config/database');
    const result = await query(
      `SELECT latitude, longitude, heading, speed, recorded_at
       FROM trip_locations
       WHERE trip_id = $1
       ORDER BY recorded_at ASC`,
      [req.params.tripId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
});

module.exports = router;