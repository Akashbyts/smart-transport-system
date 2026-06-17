const { getNearbyBuses, getBusLocation } = require('../../services/location.service');
const logger = require('../../utils/logger');

function registerPassengerHandlers(io, socket) {
  // Passenger subscribes to a specific bus/trip
  socket.on('passenger:track:bus', ({ busId, tripId }) => {
    socket.join(`bus:${busId}`);
    if (tripId) socket.join(`trip:${tripId}`);
    logger.info(`Passenger ${socket.user.id} tracking bus ${busId}`);
  });

  // Passenger stops tracking
  socket.on('passenger:untrack:bus', ({ busId }) => {
    socket.leave(`bus:${busId}`);
  });

  // Passenger requests nearby buses
  socket.on('passenger:nearby:buses', async ({ latitude, longitude, radiusKm }) => {
    try {
      const buses = await getNearbyBuses(latitude, longitude, radiusKm || 2);
      socket.emit('passenger:nearby:buses:result', { buses });
    } catch (error) {
      logger.error('passenger:nearby:buses error:', error);
      socket.emit('error', { message: 'Failed to fetch nearby buses' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Passenger ${socket.user.id} disconnected`);
  });
}

module.exports = { registerPassengerHandlers };