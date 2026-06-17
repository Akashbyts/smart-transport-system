const express = require('express');
const router = express.Router();
const controller = require('./driver.controller');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { upload } = require('../../middleware/upload');
const { kycSchema, updateProfileSchema } = require('./driver.validator');

const driverAuth = authenticate(['driver']);

router.get('/profile', driverAuth, controller.getProfile);
router.patch('/profile', driverAuth, validate(updateProfileSchema), controller.updateProfile);
router.post('/kyc', driverAuth,
  upload.fields([
    { name: 'license_image', maxCount: 1 },
    { name: 'id_card_image', maxCount: 1 },
    { name: 'selfie_image', maxCount: 1 }
  ]),
  validate(kycSchema),
  controller.submitKYC
);
router.get('/trips', driverAuth, controller.getTrips);

module.exports = router;