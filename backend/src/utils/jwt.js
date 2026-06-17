const jwt = require('jsonwebtoken');
const { getRedisClient } = require('../config/redis');

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d'
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

async function storeRefreshToken(userId, role, token) {
  const redis = getRedisClient();
  const key = `refresh_token:${role}:${userId}`;
  await redis.setEx(key, 7 * 24 * 60 * 60, token);
}

async function getStoredRefreshToken(userId, role) {
  const redis = getRedisClient();
  return redis.get(`refresh_token:${role}:${userId}`);
}

async function deleteRefreshToken(userId, role) {
  const redis = getRedisClient();
  return redis.del(`refresh_token:${role}:${userId}`);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  storeRefreshToken,
  getStoredRefreshToken,
  deleteRefreshToken
};