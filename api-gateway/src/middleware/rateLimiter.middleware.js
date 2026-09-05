const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const config = require('../config/gateway.config');

const logRateLimitViolation = async (req, type) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const SecurityEvent = mongoose.model('SecurityEvent');
      await SecurityEvent.create({
        eventType: 'RATE_LIMIT_EXCEEDED',
        severity: 'HIGH',
        sourceIp: req.ip || '127.0.0.1',
        endpoint: req.originalUrl,
        userId: req.user ? req.user.userId : null,
        description: `Rate limit (${type}) exceeded from IP ${req.ip} on endpoint '${req.originalUrl}'`,
        details: {
          ip: req.ip,
          type,
          headers: req.headers,
        },
      });
    }
  } catch (err) {
    console.error('[RateLimiter Security Log Error]', err.message);
  }
};

// General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  skip: (req) => req.user?.role === 'Admin',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logRateLimitViolation(req, 'GENERAL_API');
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Too many requests from this IP address.',
        retryAfterMs: config.rateLimitWindowMs,
      },
    });
  },
});

// Strict Auth Endpoint Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.authRateLimitMaxRequests, // 10 requests per 15 minutes
  skip: (req) => req.body?.email?.trim().toLowerCase() === 'admin@security.local',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logRateLimitViolation(req, 'AUTHENTICATION');
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
        retryAfterMs: 15 * 60 * 1000,
      },
    });
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
};
