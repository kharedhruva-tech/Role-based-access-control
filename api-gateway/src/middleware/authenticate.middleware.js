const { verifyAccessToken } = require('../utils/jwt.util');

const authenticate = (options = { required: true }) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (options.required) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication token is missing or malformed',
            details: 'Access token must be provided in Authorization header as Bearer <token>',
          },
        });
      } else {
        req.user = null;
        return next();
      }
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Access token is invalid or expired',
          details: 'Please login again to receive a fresh access token',
        },
      });
    }

    req.user = decoded;
    next();
  };
};

module.exports = authenticate;
