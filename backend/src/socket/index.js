const { Server } = require('socket.io');
const { socketAuthMiddleware } = require('./middleware/socketAuth');
const { registerDriverHandlers } = require('./handlers/driver.handler');
const { registerPassengerHandlers } = require('./handlers/passenger.handler');
const { getSubClient, getPubClient } = require('../config/redis');
const logger = require('../utils/logger');

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Auth middleware
  io.use(socketAuthMiddleware);

  // Subscribe to Redis for location updates
  const subClient = getSubClient();
  subClient.subscribe('bus_location_updates', (message) => {
    try {
      const location = JSON.parse(message);
      // Broadcast to passengers tracking this bus
      io.to(`bus:${location.busId}`).emit('bus:location:update', location);
      io.to(`trip:${location.tripId}`).emit('bus:location:update', location);
    } catch (error) {
      logger.error('Redis subscription message error:', error);
    }
  });

  io.on('connection', (socket) => {
    const { role, id } = socket.user;
    logger.info(`Socket connected: ${role} ${id} [${socket.id}]`);

    if (role === 'driver') {
      registerDriverHandlers(io, socket);
    } else if (role === 'passenger') {
      registerPassengerHandlers(io, socket);
    }
  });

  logger.info('Socket.IO server initialized');
  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

module.exports = { initializeSocket, getIO };