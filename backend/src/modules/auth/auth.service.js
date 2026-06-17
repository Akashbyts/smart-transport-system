const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../../config/database');
const {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  getStoredRefreshToken,
  deleteRefreshToken,
  verifyRefreshToken
} = require('../../utils/jwt');
const { sendOTP, verifyOTP } = require('../../services/otp.service');
const { createError } = require('../../middleware/errorHandler');

async function sendPhoneOTP(phone) {
  await sendOTP(phone);
  return true;
}

async function verifyPhoneOTP(phone, otp) {
  return verifyOTP(phone, otp);
}

async function registerDriver(data) {
  const { name, phone, password } = data;

  const existing = await query('SELECT id FROM drivers WHERE phone = $1', [phone]);
  if (existing.rows.length > 0) throw createError('Phone number already registered', 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const id = uuidv4();

  const result = await query(
    `INSERT INTO drivers (id, name, phone, password, status, is_verified, created_at)
     VALUES ($1, $2, $3, $4, 'pending', false, NOW())
     RETURNING id, name, phone, status`,
    [id, name, phone, hashedPassword]
  );

  return result.rows[0];
}

async function loginDriver(phone, password) {
  const result = await query(
    `SELECT id, name, phone, password, status, is_verified FROM drivers WHERE phone = $1`,
    [phone]
  );

  if (result.rows.length === 0) throw createError('Invalid credentials', 401);

  const driver = result.rows[0];
  const isMatch = await bcrypt.compare(password, driver.password);
  if (!isMatch) throw createError('Invalid credentials', 401);

  // REMOVED: status checks for pending/rejected/suspended
  // Driver can login freely, only KYC blocks trip starting

  const payload = { id: driver.id, role: 'driver', phone: driver.phone };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await storeRefreshToken(driver.id, 'driver', refreshToken);

  return {
    driver: {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      status: driver.status
    },
    accessToken,
    refreshToken
  };
}

async function registerPassenger(data) {
  const { name, email, phone, password } = data;

  const existing = await query(
    'SELECT id FROM passengers WHERE phone = $1 OR email = $2',
    [phone, email]
  );
  if (existing.rows.length > 0) throw createError('Phone or email already registered', 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const id = uuidv4();

  const result = await query(
    `INSERT INTO passengers (id, name, email, phone, password, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING id, name, email, phone`,
    [id, name, email, phone, hashedPassword]
  );

  return result.rows[0];
}

async function loginPassenger(phone, password) {
  const result = await query(
    'SELECT id, name, email, phone, password FROM passengers WHERE phone = $1',
    [phone]
  );

  if (result.rows.length === 0) throw createError('Invalid credentials', 401);

  const passenger = result.rows[0];
  const isMatch = await bcrypt.compare(password, passenger.password);
  if (!isMatch) throw createError('Invalid credentials', 401);

  const payload = { id: passenger.id, role: 'passenger', phone: passenger.phone };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await storeRefreshToken(passenger.id, 'passenger', refreshToken);

  return {
    passenger: {
      id: passenger.id, name: passenger.name,
      email: passenger.email, phone: passenger.phone
    },
    accessToken,
    refreshToken
  };
}

async function loginAdmin(email, password) {
  const result = await query(
    'SELECT id, name, email, password FROM admins WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) throw createError('Invalid credentials', 401);

  const admin = result.rows[0];
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw createError('Invalid credentials', 401);

  const payload = { id: admin.id, role: 'admin', email: admin.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await storeRefreshToken(admin.id, 'admin', refreshToken);

  return {
    admin: { id: admin.id, name: admin.name, email: admin.email },
    accessToken,
    refreshToken
  };
}

async function refreshTokens(refreshToken, role) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw createError('Invalid refresh token', 401);
  }

  const stored = await getStoredRefreshToken(decoded.id, role);
  if (!stored || stored !== refreshToken) throw createError('Refresh token revoked', 401);

  const payload = { id: decoded.id, role: decoded.role, phone: decoded.phone, email: decoded.email };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  await storeRefreshToken(decoded.id, role, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logout(userId, role) {
  await deleteRefreshToken(userId, role);
}

module.exports = {
  sendPhoneOTP,
  verifyPhoneOTP,
  registerDriver,
  loginDriver,
  registerPassenger,
  loginPassenger,
  loginAdmin,
  refreshTokens,
  logout
};