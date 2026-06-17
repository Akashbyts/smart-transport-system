const { v4: uuidv4 } = require('uuid');
const { query } = require('../../config/database');
const { updateBusLocation, removeBusFromActive } = require('../../services/location.service');
const { createError } = require('../../middleware/errorHandler');

async function startTrip(driverId, { bus_id, route_id }) {
  // Check driver is approved
  const driverResult = await query(
    `SELECT status, is_verified FROM drivers WHERE id = $1`,
    [driverId]
  );
  const driver = driverResult.rows[0];
  if (!driver || driver.status !== 'approved') {
    throw createError('Driver not approved to start trips', 403);
  }

  // Check no active trip exists
  const activeTrip = await query(
    `SELECT id FROM trips WHERE driver_id = $1 AND status = 'active'`,
    [driverId]
  );
  if (activeTrip.rows.length > 0) {
    throw createError('You already have an active trip. End it first.', 409);
  }

  // Check bus exists and is available
  const busResult = await query(
    `SELECT id, bus_number FROM buses WHERE id = $1 AND is_active = true`,
    [bus_id]
  );
  if (busResult.rows.length === 0) throw createError('Bus not found or inactive', 404);

  // Check route exists
  const routeResult = await query(
    'SELECT id FROM routes WHERE id = $1 AND is_active = true',
    [route_id]
  );
  if (routeResult.rows.length === 0) throw createError('Route not found', 404);

  const tripId = uuidv4();
  const result = await query(
    `INSERT INTO trips (id, driver_id, bus_id, route_id, status, started_at, created_at)
     VALUES ($1, $2, $3, $4, 'active', NOW(), NOW())
     RETURNING id, status, started_at`,
    [tripId, driverId, bus_id, route_id]
  );

  return result.rows[0];
}

async function endTrip(driverId, tripId) {
  const tripResult = await query(
    `SELECT id, bus_id, status FROM trips WHERE id = $1 AND driver_id = $2`,
    [tripId, driverId]
  );

  if (tripResult.rows.length === 0) throw createError('Trip not found', 404);
  const trip = tripResult.rows[0];
  if (trip.status !== 'active') throw createError('Trip is not active', 400);

  await query(
    `UPDATE trips SET status = 'completed', ended_at = NOW() WHERE id = $1`,
    [tripId]
  );

  await removeBusFromActive(trip.bus_id);

  return { tripId, status: 'completed' };
}

async function updateLocation(driverId, locationData) {
  // Verify the trip belongs to this driver
  const tripResult = await query(
    `SELECT id FROM trips WHERE id = $1 AND driver_id = $2 AND status = 'active'`,
    [locationData.trip_id, driverId]
  );
  if (tripResult.rows.length === 0) {
    throw createError('Active trip not found', 404);
  }

  return updateBusLocation({
    tripId: locationData.trip_id,
    driverId,
    busId: locationData.bus_id,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    heading: locationData.heading,
    speed: locationData.speed
  });
}

async function getActiveTripForDriver(driverId) {
  const result = await query(
    `SELECT t.id, t.status, t.started_at,
            b.id as bus_id, b.bus_number,
            r.id as route_id, r.route_number, r.route_name
     FROM trips t
     JOIN buses b ON t.bus_id = b.id
     JOIN routes r ON t.route_id = r.id
     WHERE t.driver_id = $1 AND t.status = 'active'
     LIMIT 1`,
    [driverId]
  );
  return result.rows[0] || null;
}

module.exports = { startTrip, endTrip, updateLocation, getActiveTripForDriver };