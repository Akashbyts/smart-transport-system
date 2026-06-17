const { query } = require('../../config/database');
const { createError } = require('../../middleware/errorHandler');

async function getDriverProfile(driverId) {
  const result = await query(
    `SELECT d.id, d.name, d.phone, d.status, d.is_verified,
            dv.license_number, dv.license_expiry, dv.id_card_number,
            dv.license_image, dv.id_card_image, dv.selfie_image,
            dv.status as kyc_status
     FROM drivers d
     LEFT JOIN driver_verification dv ON dv.driver_id = d.id
     WHERE d.id = $1`,
    [driverId]
  );
  if (result.rows.length === 0) throw createError('Driver not found', 404);
  return result.rows[0];
}

async function submitKYC(driverId, kycData, files) {
  const existing = await query(
    'SELECT id FROM driver_verification WHERE driver_id = $1',
    [driverId]
  );
  if (existing.rows.length > 0) throw createError('KYC already submitted', 409);

  const { license_number, license_expiry, id_card_number } = kycData;
  const licenseImage = files?.license_image?.[0]?.filename || null;
  const idCardImage = files?.id_card_image?.[0]?.filename || null;
  const selfieImage = files?.selfie_image?.[0]?.filename || null;

  if (!licenseImage || !idCardImage || !selfieImage) {
    throw createError('All three documents are required', 400);
  }

  await query(
    `INSERT INTO driver_verification
       (driver_id, license_number, license_expiry, id_card_number,
        license_image, id_card_image, selfie_image, status, submitted_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())`,
    [driverId, license_number, license_expiry, id_card_number,
     licenseImage, idCardImage, selfieImage]
  );

  return { message: 'KYC submitted successfully' };
}

async function getDriverTrips(driverId, limit = 20, offset = 0) {
  const result = await query(
    `SELECT t.id, t.status, t.started_at, t.ended_at,
            b.bus_number, r.route_number, r.route_name
     FROM trips t
     JOIN buses b ON t.bus_id = b.id
     JOIN routes r ON t.route_id = r.id
     WHERE t.driver_id = $1
     ORDER BY t.created_at DESC
     LIMIT $2 OFFSET $3`,
    [driverId, limit, offset]
  );

  const countResult = await query(
    'SELECT COUNT(*) FROM trips WHERE driver_id = $1',
    [driverId]
  );

  return {
    trips: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
}

async function updateProfile(driverId, data) {
  const { name } = data;
  const result = await query(
    'UPDATE drivers SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, phone',
    [name, driverId]
  );
  return result.rows[0];
}

module.exports = { getDriverProfile, submitKYC, getDriverTrips, updateProfile };