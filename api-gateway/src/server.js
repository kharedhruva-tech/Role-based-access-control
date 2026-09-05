const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config/gateway.config');

// Import Middlewares
const authenticate = require('./middleware/authenticate.middleware');
const authorize = require('./middleware/authorize.middleware');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter.middleware');
const auditLogger = require('./middleware/auditLogger.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const setupProxy = require('./proxy/serviceRouter');
const registerTelemetryModels = require('./models/telemetry.models');

// Load Mongoose models for direct gateway logging
require('../../backend/src/models/User');
require('../../backend/src/models/Role');
require('../../backend/src/models/Permission');
require('../../backend/src/models/AuditLog');
require('../../backend/src/models/SecurityEvent');
require('../../backend/src/models/ApiRequest');

const app = express();

// 1. Security Headers & CORS
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      let isLocalDevelopmentOrigin = false;
      if (process.env.NODE_ENV !== 'production' && origin) {
        try {
          const parsedOrigin = new URL(origin);
          isLocalDevelopmentOrigin =
            parsedOrigin.protocol === 'http:' &&
            ['localhost', '127.0.0.1', '[::1]'].includes(parsedOrigin.hostname);
        } catch {
          isLocalDevelopmentOrigin = false;
        }
      }

      if (!origin || config.allowedOrigins.indexOf(origin) !== -1 || config.allowedOrigins.includes('*') || isLocalDevelopmentOrigin) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy denial: Origin not allowed by API Gateway'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Correlation-ID'],
  })
);

app.use(morgan('combined'));
app.use(express.json());

// 2. Global Request Telemetry & Audit Logger
app.use(auditLogger());

// 3. Health Check
app.get('/gateway-health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    backendServiceUrl: config.backendServiceUrl,
    dbConnection: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
  });
});

// 4. ROUTE LEVEL AUTHENTICATION & RBAC AUTHORIZATION GATEKEEPER

// --- Auth Routes ---
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/me', authenticate({ required: true }));
app.use('/api/v1/auth/logout', authenticate({ required: true }));

// --- User Management Routes (RBAC Protected) ---
app.get('/api/v1/users', authenticate({ required: true }), authorize('user:read'));
app.get('/api/v1/users/:id', authenticate({ required: true }), authorize('user:read'));
app.post('/api/v1/users', authenticate({ required: true }), authorize('user:create'));
app.put('/api/v1/users/:id', authenticate({ required: true }), authorize('user:update'));
app.delete('/api/v1/users/:id', authenticate({ required: true }), authorize('user:delete'));

// --- Role Management Routes (RBAC Protected) ---
app.get('/api/v1/roles', authenticate({ required: true }), authorize('role:read'));
app.post('/api/v1/roles', authenticate({ required: true }), authorize('role:create'));
app.put('/api/v1/roles/:id', authenticate({ required: true }), authorize('role:update'));
app.delete('/api/v1/roles/:id', authenticate({ required: true }), authorize('role:delete'));

// --- Permissions Route ---
app.get('/api/v1/permissions', authenticate({ required: true }), authorize('role:read'));

// --- Audit & Security Monitoring Routes ---
app.get('/api/v1/audit-logs', authenticate({ required: true }), authorize('audit:read'));
  app.get('/api/v1/security/events', authenticate({ required: true }), authorize('security:read'));
app.get('/api/v1/security/metrics', authenticate({ required: true }), authorize('security:read'));

// 5. General Rate Limiter for all proxy traffic
app.use('/api', generalLimiter);

// 6. Reverse Proxy Handler to Downstream Backend Microservice
const proxyHandler = setupProxy(app);
app.use('/api', proxyHandler);

// 7. Centralized Gateway Error Handler
app.use(errorHandler);

// Start Gateway and connect DB
const startGateway = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure_rbac_gateway';
    await mongoose.connect(mongoUri);
    registerTelemetryModels();
    console.log('[API Gateway] Connected to MongoDB for Audit & Security telemetry.');

    const server = app.listen(config.port, () => {
      console.log(`[API Gateway] Listening on http://localhost:${config.port}`);
      console.log(`[API Gateway] Proxy Target -> ${config.backendServiceUrl}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[API Gateway] Port ${config.port} is already in use. Reusing the existing service.`);
        process.exit(0);
      }

      console.error('[API Gateway Startup Failed]', error.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('[API Gateway Startup Failed]', err.message);
    process.exit(1);
  }
};

startGateway();
