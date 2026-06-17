const { verifyAccessToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');

function authenticate(roles = []) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 'Access token required', 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return errorResponse(res, 'Insufficient permissions', 403);
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, 'Access token expired', 401);
      }
      return errorResponse(res, 'Invalid access token', 401);
    }
  };
}

module.exports = { authenticate };