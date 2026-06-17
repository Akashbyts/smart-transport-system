const { query } = require('../../config/database');
const { createError } = require('../../middleware/errorHandler');
const { getRedisClient } = require('../../config/redis');

async function getPendingDrivers(limit = 20, offset = 0) {
  const result = await query(
    `SELECT d.id, d.name, d.phone, d.status, d.created_at,
            dv.license_number, dv.id_card_number, dv.license_image,
            dv.id_card_image, dv.selfie_image, dv.status as kyc_status, dv.submitted_at
     FROM drivers d
     LEFT JOIN driver_verification dv ON dv.driver_id = d.id
     WHERE d.status = 'pending'
     ORDER BY d.created_at ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const count = await query(`SELECT COUNT(*) FROM drivers WHERE status = 'pending'`);
  return { drivers: result.rows, total: parseInt(count.rows[0].count) };
}

async function approveDriver(driverId) {
  const result = await query(
    `UPDATE drivers SET status = 'approved', is_verified = true, updated_at = NOW()
     WHERE id = $1 RETURNING id, name, phone, status`,
    [driverId]
  );
  if (result.rows.length === 0) throw createError('Driver not found', 404);

  await query(
    `UPDATE driver_verification SET status = 'approved' WHERE driver_id = $1`,
    [driverId]
  );

  return result.rows[0];
}

async function rejectDriver(driverId, reason) {
  const result = await query(
    `UPDATE drivers SET status = 'rejected', updated_at = NOW()
     WHERE id = $1 RETURNING id, name, phone, status`,
    [driverId]
  );
  if (result.rows.length === 0) throw createError('Driver not found', 404);

  await query(
    `UPDATE driver_verification SET status = 'rejected', rejection_reason = $2
     WHERE driver_id = $1`,
    [driverId, reason || 'Documents not acceptable']
  );

  return result.rows[0];
}

async function getDashboardStats() {
  const redis = getRedisClient();

  const [
    totalDrivers, activeDrivers, totalPassengers,
    totalBuses, activeBuses, totalRoutes,
    tripsToday, tripsTotal
  ] = await Promise.all([
    query('SELECT COUNT(*) FROM drivers'),
    query(`SELECT COUNT(*) FROM drivers WHERE status = 'approved'`),
    query('SELECT COUNT(*) FROM passengers'),
    query('SELECT COUNT(*) FROM buses WHERE is_active = true'),
    query(`SELECT COUNT(*) FROM trips WHERE status = 'active'`),
    query('SELECT COUNT(*) FROM routes WHERE is_active = true'),
    query(`SELECT COUNT(*) FROM trips WHERE started_at::date = CURRENT_DATE`),
    query('SELECT COUNT(*) FROM trips')
  ]);

  // Count currently online buses from Redis
  let onlineBuses = 0;
  try {
    onlineBuses = await redis.zCard('active_buses');
  } catch (_) {}

  return {
    totalDrivers: parseInt(totalDrivers.rows[0].count),
    activeDrivers: parseInt(activeDrivers.rows[0].count),
    totalPassengers: parseInt(totalPassengers.rows[0].count),
    totalBuses: parseInt(totalBuses.rows[0].count),
    activeBuses: parseInt(activeBuses.rows[0].count),
    onlineBuses,
    totalRoutes: parseInt(totalRoutes.rows[0].count),
    tripsToday: parseInt(tripsToday.rows[0].count),
    tripsTotal: parseInt(tripsTotal.rows[0].count)
  };
}

async function getAllDrivers(limit = 20, offset = 0, status = null) {
  let whereClause = '';
  const values = [limit, offset];

  if (status) {
    whereClause = `WHERE d.status = $3`;
    values.push(status);
  }

  const result = await query(
    `SELECT d.id, d.name, d.phone, d.status, d.is_verified, d.created_at,
            dv.status as kyc_status, dv.license_number,
            dv.id_card_number, dv.license_image, dv.id_card_image,
            dv.submitted_at
     FROM drivers d
     LEFT JOIN driver_verification dv ON dv.driver_id = d.id
     ${whereClause}
     ORDER BY d.created_at DESC
     LIMIT $1 OFFSET $2`,
    values
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM drivers d ${whereClause}`,
    status ? [status] : []
  );

  return {
    drivers: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
}

async function getAllTrips(limit = 20, offset = 0) {
  const result = await query(
    `SELECT t.id, t.status, t.started_at, t.ended_at,
            d.name as driver_name, d.phone as driver_phone,
            b.bus_number, r.route_number, r.route_name,
            r.stops, r.id as route_id
     FROM trips t
     JOIN drivers d ON t.driver_id = d.id
     JOIN buses b ON t.bus_id = b.id
     JOIN routes r ON t.route_id = r.id
     ORDER BY t.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const count = await query('SELECT COUNT(*) FROM trips');
  return { trips: result.rows, total: parseInt(count.rows[0].count) };
}

async function createAdmin(data) {
  const { name, email, password } = data;
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');

  const existing = await query(
    'SELECT id FROM admins WHERE email = $1', [email]
  );
  if (existing.rows.length > 0) {
    throw createError('Email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await query(
    `INSERT INTO admins (id, name, email, password, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, name, email, created_at`,
    [uuidv4(), name, email, hashedPassword]
  );
  return result.rows[0];
}

async function getAllAdmins() {
  const result = await query(
    'SELECT id, name, email, created_at FROM admins ORDER BY created_at DESC'
  );
  return result.rows;
}

module.exports = {
  getPendingDrivers, approveDriver, rejectDriver,
  getDashboardStats, getAllDrivers, getAllTrips,
  createAdmin, getAllAdmins
};