const rateLimit = require('express-rate-limit');

const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in a minute.'
  }
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again in 15 minutes.'
  }
});

const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait a minute.'
  }
});

const locationRateLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Location update rate exceeded.'
  }
});

module.exports = {
  globalRateLimiter,
  authRateLimiter,
  otpRateLimiter,
  locationRateLimiter
};