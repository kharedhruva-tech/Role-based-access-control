const mongoose = require('mongoose');

const authorize = (requiredPermissions = []) => {
  const permissionsArray = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication context required for authorization check',
        },
      });
    }

    const userPermissions = req.user.permissions || [];
    const userRole = req.user.role || 'Guest';

    // Admin bypass option or permission verification
    const hasPermission =
      userRole === 'Admin' ||
      permissionsArray.every((perm) => userPermissions.includes(perm));

    if (!hasPermission) {
      // Log authorization breach to SecurityEvent collection asynchronously
      try {
        if (mongoose.connection.readyState === 1) {
          const SecurityEvent = mongoose.model('SecurityEvent');
          await SecurityEvent.create({
            eventType: 'AUTHORIZATION_DENIED',
            severity: 'MEDIUM',
            sourceIp: req.ip || req.connection.remoteAddress || '127.0.0.1',
            endpoint: req.originalUrl,
            userId: req.user.userId || null,
            description: `User '${req.user.username}' (${userRole}) attempted unauthorized access to '${req.method} ${req.originalUrl}'`,
            details: {
              requiredPermissions: permissionsArray,
              userPermissions,
              role: userRole,
            },
          });
        }
      } catch (err) {
        console.error('[Gateway Security Audit Error]', err.message);
      }

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access Denied: Insufficient Role Permissions',
          details: `Role '${userRole}' lacks required permission(s): [${permissionsArray.join(', ')}]`,
        },
      });
    }

    next();
  };
};

module.exports = authorize;
