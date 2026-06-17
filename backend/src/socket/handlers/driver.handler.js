const { updateBusLocation, removeBusFromActive } = require('../../services/location.service');
const { query } = require('../../config/database');
const logger = require('../../utils/logger');

function registerDriverHandlers(io, socket) {
  // Driver joins their personal room
  socket.on('driver:join', async ({ tripId }) => {
    try {
      socket.join(`trip:${tripId}`);
      socket.join(`driver:${socket.user.id}`);
      logger.info(`Driver ${socket.user.id} joined trip ${tripId}`);
    } catch (error) {
      logger.error('driver:join error:', error);
    }
  });

  // Receive GPS location from driver
  socket.on('driver:location', async (data) => {
    try {
      const { tripId, busId, latitude, longitude, heading, speed } = data;

      if (!tripId || !busId || !latitude || !longitude) {
        socket.emit('error', { message: 'Invalid location data' });
        return;
      }

      const location = await updateBusLocation({
        tripId,
        driverId: socket.user.id,
        busId,
        latitude,
        longitude,
        heading,
        speed
      });

      // Acknowledge to driver
      socket.emit('driver:location:ack', { success: true, timestamp: location.timestamp });

    } catch (error) {
      logger.error('driver:location error:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  });

  // Driver ends trip via socket
  socket.on('driver:trip:end', async ({ tripId, busId }) => {
    try {
      await query(
        `UPDATE trips SET status = 'completed', ended_at = NOW() WHERE id = $1`,
        [tripId]
      );
      await removeBusFromActive(busId);

      io.to(`trip:${tripId}`).emit('trip:ended', { tripId });
      socket.leave(`trip:${tripId}`);
      logger.info(`Trip ${tripId} ended by driver ${socket.user.id}`);
    } catch (error) {
      logger.error('driver:trip:end error:', error);
    }
  });

  socket.on('disconnect', async () => {
    logger.info(`Driver ${socket.user.id} disconnected`);
  });
}

module.exports = { registerDriverHandlers };