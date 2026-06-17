const { Server } = require('socket.io');
const { socketAuthMiddleware } = require('../socket/middleware/socketAuth');
const logger = require('../utils/logger');

let ioInstance = null;

function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1 MB max message size
    connectTimeout: 45000
  });

  // Apply auth middleware to all socket connections
  io.use(socketAuthMiddleware);

  // Track connection count for monitoring
  let connectionCount = 0;

  io.on('connection', (socket) => {
    connectionCount++;
    logger.info(
      `Socket connected | ID: ${socket.id} | Role: ${socket.user?.role} | ` +
      `UserID: ${socket.user?.id} | Total: ${connectionCount}`
    );

    socket.on('disconnect', (reason) => {
      connectionCount--;
      logger.info(
        `Socket disconnected | ID: ${socket.id} | Reason: ${reason} | ` +
        `Total: ${connectionCount}`
      );
    });

    socket.on('error', (error) => {
      logger.error(`Socket error | ID: ${socket.id} | Error: ${error.message}`);
    });
  });

  ioInstance = io;
  logger.info('Socket.IO server configured successfully');
  return io;
}
io.on('connection', (socket) => {
  connectionCount++;
  logger.info(`Socket connected | ID: ${socket.id} | Role: ${socket.user?.role}`);

  // ✅ ADD THIS: Driver joins their trip room and broadcasts location
  socket.on('location_update', (data) => {
    const { tripId, latitude, longitude, speed, heading, busId } = data;

    if (!tripId || !latitude || !longitude) return;

    // Join trip room (idempotent)
    socket.join(`trip_${tripId}`);

    const payload = { tripId, busId, latitude, longitude, speed, heading, timestamp: Date.now() };

    // Broadcast to passengers watching this trip
    socket.to(`trip_${tripId}`).emit('bus_location', payload);

    // Also broadcast globally so all passengers can see active buses
    socket.broadcast.emit('bus_location', payload);

    logger.info(`Location update | Trip: ${tripId} | Bus: ${busId} | ${latitude},${longitude}`);
  });

  // ✅ ADD THIS: Passengers subscribe to a specific trip
  socket.on('subscribe_trip', (tripId) => {
    socket.join(`trip_${tripId}`);
    logger.info(`Socket ${socket.id} subscribed to trip_${tripId}`);
  });

  socket.on('disconnect', (reason) => {
    connectionCount--;
    logger.info(`Socket disconnected | ID: ${socket.id} | Reason: ${reason}`);
  });

  socket.on('error', (error) => {
    logger.error(`Socket error | ID: ${socket.id} | Error: ${error.message}`);
  });
});
function getSocketInstance() {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized. Call createSocketServer first.');
  }
  return ioInstance;
}

function emitToRoom(room, event, data) {
  if (!ioInstance) return;
  ioInstance.to(room).emit(event, data);
}

function emitToAll(event, data) {
  if (!ioInstance) return;
  ioInstance.emit(event, data);
}

function getConnectedSocketsCount() {
  if (!ioInstance) return 0;
  return ioInstance.engine.clientsCount;
}

module.exports = {
  createSocketServer,
  getSocketInstance,
  emitToRoom,
  emitToAll,
  getConnectedSocketsCount
};