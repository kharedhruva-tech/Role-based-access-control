const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userRole: {
      type: String,
      default: 'ANONYMOUS',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
    },
    httpMethod: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    },
    endpoint: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['SUCCESS', 'DENIED', 'FAILED', 'RATE_LIMITED'],
      default: 'SUCCESS',
    },
    statusCode: {
      type: Number,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
  }
);

auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
