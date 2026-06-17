const { createClient } = require('redis');
const logger = require('../utils/logger');

let redisClient;
let pubClient;
let subClient;

async function connectRedis() {
  const redisConfig = {
    socket: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      connectTimeout: 5000,        // fail after 5 seconds
      reconnectStrategy: (retries) => {
        if (retries > 5) {
          logger.error('Redis max retries reached. Is Redis running?');
          return new Error('Redis max retries reached');
        }
        const delay = Math.min(retries * 500, 3000);
        logger.warn(`Redis reconnecting in ${delay}ms... (attempt ${retries})`);
        return delay;
      }
    }
  };

  if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== '') {
    redisConfig.password = process.env.REDIS_PASSWORD;
  }

  redisClient = createClient(redisConfig);
  pubClient  = createClient(redisConfig);
  subClient  = createClient(redisConfig);

  redisClient.on('error', (err) => logger.error('Redis client error:', err.message));
  pubClient.on('error',   (err) => logger.error('Redis pub error:',    err.message));
  subClient.on('error',   (err) => logger.error('Redis sub error:',    err.message));

  redisClient.on('connect', () => logger.info('Redis client connected'));
  pubClient.on('connect',   () => logger.info('Redis pub connected'));
  subClient.on('connect',   () => logger.info('Redis sub connected'));

  await Promise.all([
    redisClient.connect(),
    pubClient.connect(),
    subClient.connect()
  ]);
}

function getRedisClient() {
  if (!redisClient) throw new Error('Redis not connected');
  return redisClient;
}

function getPubClient() {
  if (!pubClient) throw new Error('Redis pub client not connected');
  return pubClient;
}

function getSubClient() {
  if (!subClient) throw new Error('Redis sub client not connected');
  return subClient;
}

module.exports = {
  connectRedis,
  getRedisClient,
  getPubClient,
  getSubClient
};