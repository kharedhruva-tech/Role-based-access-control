const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config/gateway.config');

const setupProxy = (app) => {
  const backendProxy = createProxyMiddleware({
    target: config.backendServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/': '/api/',
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Inject identity context headers to internal microservice calls
        if (req.user) {
          proxyReq.setHeader('X-User-Id', req.user.userId || '');
          proxyReq.setHeader('X-User-Role', req.user.role || '');
          proxyReq.setHeader('X-User-Permissions', JSON.stringify(req.user.permissions || []));
        }
        if (req.requestId) {
          proxyReq.setHeader('X-Correlation-ID', req.requestId);
        }

        // Re-stream JSON body if pre-parsed by body-parser / express.json()
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      proxyRes: (proxyRes, req, res) => {
        // Transparent proxy response passing
      },
      error: (err, req, res) => {
        console.error('[Proxy Error]', err.message);
        res.status(502).json({
          success: false,
          error: {
            code: 'BAD_GATEWAY',
            message: 'Unable to reach downstream backend microservice',
            details: err.message,
          },
        });
      },
    },
  });

  return backendProxy;
};

module.exports = setupProxy;
