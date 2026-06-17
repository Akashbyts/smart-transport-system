const { verifyAccessToken } = require('../../utils/jwt');
const logger = require('../../utils/logger');

function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token ||
                  socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = verifyAccessToken(token);
    socket.user = decoded;
    next();
  } catch (error) {
    logger.warn(`Socket auth failed: ${error.message}`);
    next(new Error('Invalid authentication token'));
  }
}

module.exports = { socketAuthMiddleware };