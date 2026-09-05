const jwt = require('jsonwebtoken');
const config = require('../config/gateway.config');

exports.verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
};
