require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initializeSocket } = require('./src/socket');
const { connectDatabase } = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    logger.info('Connecting to PostgreSQL...');
    await connectDatabase();
    logger.info('PostgreSQL connected successfully');

    logger.info('Connecting to Redis...');
    await connectRedis();
    logger.info('Redis connected successfully');

    const server = http.createServer(app);

    logger.info('Initializing Socket.IO...');
    initializeSocket(server);
    logger.info('Socket.IO initialized');

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT',  () => gracefulShutdown(server));

  } catch (error) {
    logger.error('Failed to start server:', error.message);
    logger.error('Make sure PostgreSQL and Redis are running.');
    process.exit(1);
  }
}

async function gracefulShutdown(server) {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
}

startServer();