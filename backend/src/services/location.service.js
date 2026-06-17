const { query } = require('../config/database');
const { getRedisClient, getPubClient } = require('../config/redis');
const { getBoundingBox } = require('../utils/geo');
const logger = require('../utils/logger');

async function updateBusLocation({ tripId, driverId, busId, latitude, longitude, heading, speed }) {
  const redis = getRedisClient();
  const pub = getPubClient();

  const locationData = {
    tripId,
    driverId,
    busId,
    latitude,
    longitude,
    heading: heading || 0,
    speed: speed || 0,
    timestamp: new Date().toISOString()
  };

  // Cache latest location in Redis (fast read for passengers)
  const cacheKey = `bus:location:${busId}`;
  await redis.setEx(cacheKey, 30, JSON.stringify(locationData));

  // Also track active buses in a geo set for nearby queries
  await redis.geoAdd('active_buses', {
    longitude,
    latitude,
    member: busId.toString()
  });

  // Persist to DB every 5th update (reduce write load)
  const updateCount = await redis.incr(`bus:update_count:${busId}`);
  if (updateCount % 5 === 0) {
    await query(
      `INSERT INTO trip_locations (trip_id, latitude, longitude, heading, speed, recorded_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [tripId, latitude, longitude, locationData.heading, locationData.speed]
    );
  }

  // Publish to Redis channel for Socket.IO to broadcast
  await pub.publish('bus_location_updates', JSON.stringify(locationData));

  return locationData;
}

async function getNearbyBuses(latitude, longitude, radiusKm = 2) {
  const redis = getRedisClient();

  try {
    // Use Redis GEOSEARCH for fast nearby lookup
    const nearbyBusIds = await redis.geoSearch(
      'active_buses',
      { longitude, latitude },
      { radius: radiusKm, unit: 'km' },
      { WITHCOORD: true, WITHDIST: true, SORT: 'ASC', COUNT: 50 }
    );

    if (!nearbyBusIds || nearbyBusIds.length === 0) return [];

    const buses = [];
    for (const item of nearbyBusIds) {
      const busId = item.member;
      const cachedLocation = await redis.get(`bus:location:${busId}`);
      if (!cachedLocation) continue;

      const location = JSON.parse(cachedLocation);

      // Get bus + trip + driver details from DB
      const result = await query(
        `SELECT b.id, b.bus_number, r.route_number, r.route_name,
                d.name as driver_name, t.id as trip_id
         FROM buses b
         JOIN trips t ON t.bus_id = b.id AND t.status = 'active'
         JOIN routes r ON t.route_id = r.id
         JOIN drivers d ON t.driver_id = d.id
         WHERE b.id = $1`,
        [busId]
      );

      if (result.rows.length > 0) {
        buses.push({
          ...result.rows[0],
          ...location,
          distanceKm: parseFloat(item.distance).toFixed(2)
        });
      }
    }

    return buses;
  } catch (error) {
    logger.error('getNearbyBuses error:', error);
    return [];
  }
}

async function getBusLocation(busId) {
  const redis = getRedisClient();
  const cached = await redis.get(`bus:location:${busId}`);
  return cached ? JSON.parse(cached) : null;
}

async function removeBusFromActive(busId) {
  const redis = getRedisClient();
  await redis.zRem('active_buses', busId.toString());
  await redis.del(`bus:location:${busId}`);
  await redis.del(`bus:update_count:${busId}`);
}

module.exports = {
  updateBusLocation,
  getNearbyBuses,
  getBusLocation,
  removeBusFromActive
};