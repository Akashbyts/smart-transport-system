const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authRateLimiter, otpRateLimiter } = require('../../middleware/rateLimiter');
const {
  sendOTPSchema, verifyOTPSchema,
  driverRegisterSchema, passengerRegisterSchema,
  loginSchema, adminLoginSchema, refreshTokenSchema
} = require('./auth.validator');

router.post('/otp/send', otpRateLimiter, validate(sendOTPSchema), controller.sendOTP);
router.post('/otp/verify', otpRateLimiter, validate(verifyOTPSchema), controller.verifyOTP);

router.post('/driver/register', authRateLimiter, validate(driverRegisterSchema), controller.driverRegister);
router.post('/driver/login', authRateLimiter, validate(loginSchema), controller.driverLogin);

router.post('/passenger/register', authRateLimiter, validate(passengerRegisterSchema), controller.passengerRegister);
router.post('/passenger/login', authRateLimiter, validate(loginSchema), controller.passengerLogin);

router.post('/admin/login', authRateLimiter, validate(adminLoginSchema), controller.adminLogin);

router.post('/refresh', validate(refreshTokenSchema), controller.refreshToken);
router.post('/logout', authenticate(), controller.logout);

module.exports = router;