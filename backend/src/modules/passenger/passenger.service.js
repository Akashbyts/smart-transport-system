const { query } = require('../../config/database');
const { getNearbyBuses, getBusLocation } = require('../../services/location.service');
const { createError } = require('../../middleware/errorHandler');

async function getPassengerProfile(passengerId) {
  const result = await query(
    'SELECT id, name, email, phone, created_at FROM passengers WHERE id = $1',
    [passengerId]
  );
  if (result.rows.length === 0) throw createError('Passenger not found', 404);
  return result.rows[0];
}

async function getNearbyBusesForPassenger(latitude, longitude, radiusKm = 2) {
  return getNearbyBuses(latitude, longitude, radiusKm);
}

async function searchRoutes(searchQuery) {
  const result = await query(
    `SELECT id, route_number, route_name, start_location, end_location, stops
     FROM routes
     WHERE is_active = true
       AND (route_name ILIKE $1 OR route_number ILIKE $1
            OR start_location ILIKE $1 OR end_location ILIKE $1)
     LIMIT 20`,
    [`%${searchQuery}%`]
  );
  return result.rows;
}

async function getLiveBusLocation(busId) {
  const location = await getBusLocation(busId);
  if (!location) throw createError('Bus location not available', 404);
  return location;
}

async function getBusDetails(busId) {
  const result = await query(
    `SELECT b.id, b.bus_number, b.capacity,
            t.id as trip_id, t.started_at,
            r.route_number, r.route_name, r.start_location, r.end_location, r.stops,
            d.name as driver_name
     FROM buses b
     JOIN trips t ON t.bus_id = b.id AND t.status = 'active'
     JOIN routes r ON t.route_id = r.id
     JOIN drivers d ON t.driver_id = d.id
     WHERE b.id = $1`,
    [busId]
  );
  if (result.rows.length === 0) throw createError('Bus details not found', 404);
  return result.rows[0];
}

module.exports = {
  getPassengerProfile,
  getNearbyBusesForPassenger,
  searchRoutes,
  getLiveBusLocation,
  getBusDetails
};