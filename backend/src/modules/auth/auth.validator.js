const Joi = require('joi');

const sendOTPSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required().messages({
    'string.pattern.base': 'Phone number must be valid (e.g. +919876543210)'
  })
});

const verifyOTPSchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().length(6).required()
});

const driverRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
  password: Joi.string().min(8).required()
});

const passengerRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
  password: Joi.string().min(8).required()
});

const loginSchema = Joi.object({
  phone: Joi.string().required(),
  password: Joi.string().required()
});

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

module.exports = {
  sendOTPSchema,
  verifyOTPSchema,
  driverRegisterSchema,
  passengerRegisterSchema,
  loginSchema,
  adminLoginSchema,
  refreshTokenSchema
};