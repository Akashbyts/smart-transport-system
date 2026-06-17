const authService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/response');

async function sendOTP(req, res, next) {
  try {
    const { phone } = req.body;
    await authService.sendPhoneOTP(phone);
    return successResponse(res, {}, 'OTP sent successfully');
  } catch (error) { next(error); }
}

async function verifyOTP(req, res, next) {
  try {
    const { phone, otp } = req.body;
    const result = await authService.verifyPhoneOTP(phone, otp);
    if (!result.valid) return errorResponse(res, result.message, 400);
    return successResponse(res, {}, 'OTP verified');
  } catch (error) { next(error); }
}

async function driverRegister(req, res, next) {
  try {
    const driver = await authService.registerDriver(req.body);
    return successResponse(res, { driver }, 'Driver registered successfully', 201);
  } catch (error) { next(error); }
}

async function driverLogin(req, res, next) {
  try {
    const { phone, password } = req.body;
    const data = await authService.loginDriver(phone, password);
    return successResponse(res, data, 'Login successful');
  } catch (error) { next(error); }
}

async function passengerRegister(req, res, next) {
  try {
    const passenger = await authService.registerPassenger(req.body);
    return successResponse(res, { passenger }, 'Passenger registered successfully', 201);
  } catch (error) { next(error); }
}

async function passengerLogin(req, res, next) {
  try {
    const { phone, password } = req.body;
    const data = await authService.loginPassenger(phone, password);
    return successResponse(res, data, 'Login successful');
  } catch (error) { next(error); }
}

async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await authService.loginAdmin(email, password);
    return successResponse(res, data, 'Admin login successful');
  } catch (error) { next(error); }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const role = req.query.role || 'passenger';
    const tokens = await authService.refreshTokens(refreshToken, role);
    return successResponse(res, tokens, 'Tokens refreshed');
  } catch (error) { next(error); }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user.id, req.user.role);
    return successResponse(res, {}, 'Logged out successfully');
  } catch (error) { next(error); }
}

module.exports = {
  sendOTP, verifyOTP,
  driverRegister, driverLogin,
  passengerRegister, passengerLogin,
  adminLogin, refreshToken, logout
};