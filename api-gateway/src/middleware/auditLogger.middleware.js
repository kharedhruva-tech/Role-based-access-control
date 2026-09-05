const mongoose = require('mongoose');
const { v4: uuidv4 } = require('crypto');

const registerTelemetryModels = () => {
  if (!mongoose.models.ApiRequest) {
    mongoose.model('ApiRequest', new mongoose.Schema({}, { strict: false, collection: 'apirequests' }));
  }
  if (!mongoose.models.AuditLog) {
    mongoose.model('AuditLog', new mongoose.Schema({}, { strict: false, collection: 'auditlogs' }));
  }
};

const auditLogger = () => {
  return (req, res, next) => {
    const startTime = Date.now();
    const requestId = req.headers['x-correlation-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    req.requestId = requestId;
    res.setHeader('X-Correlation-ID', requestId);

    res.on('finish', async () => {
      const responseTimeMs = Date.now() - startTime;
      const statusCode = res.statusCode;
      const user = req.user || null;

      try {
        if (mongoose.connection.readyState === 1) {
          registerTelemetryModels();
          const ApiRequest = mongoose.model('ApiRequest');
          const AuditLog = mongoose.model('AuditLog');

          // 1. Record API Request Telemetry
          await ApiRequest.create({
            requestId,
            method: req.method,
            endpoint: req.originalUrl,
            statusCode,
            responseTimeMs,
            ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
          });

          // 2. Determine Action Name for Audit Log
          let action = `${req.method}_${req.baseUrl || req.path}`;
          if (req.originalUrl.includes('/auth/login')) action = 'USER_LOGIN';
          else if (req.originalUrl.includes('/auth/register')) action = 'USER_REGISTER';
          else if (req.originalUrl.includes('/auth/logout')) action = 'USER_LOGOUT';
          else if (req.originalUrl.includes('/users') && req.method === 'POST') action = 'USER_CREATED';
          else if (req.originalUrl.includes('/users') && req.method === 'DELETE') action = 'USER_DELETED';
          else if (req.originalUrl.includes('/users') && req.method === 'PUT') action = 'USER_UPDATED';
          else if (req.originalUrl.includes('/roles') && req.method === 'POST') action = 'ROLE_CREATED';
          else if (req.originalUrl.includes('/roles') && req.method === 'PUT') action = 'ROLE_UPDATED';
          else if (req.originalUrl.includes('/roles') && req.method === 'DELETE') action = 'ROLE_DELETED';

          let status = 'SUCCESS';
          if (statusCode === 401 || statusCode === 403) status = 'DENIED';
          else if (statusCode === 429) status = 'RATE_LIMITED';
          else if (statusCode >= 400) status = 'FAILED';

          // 3. Record Audit Log
          await AuditLog.create({
            requestId,
            userId: user ? user.userId : null,
            userRole: user ? user.role : 'ANONYMOUS',
            action,
            resource: req.originalUrl.split('?')[0],
            httpMethod: req.method,
            endpoint: req.originalUrl,
            status,
            statusCode,
            ipAddress: req.ip || '127.0.0.1',
            userAgent: req.headers['user-agent'] || '',
            metadata: {
              responseTimeMs,
              params: req.params,
            },
          });
        }
      } catch (err) {
        console.error('[AuditLogger Middleware Error]', err.message);
      }
    });

    next();
  };
};

module.exports = auditLogger;
