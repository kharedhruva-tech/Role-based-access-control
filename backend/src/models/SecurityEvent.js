const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: [
        'AUTH_FAILURE',
        'AUTHORIZATION_DENIED',
        'RATE_LIMIT_EXCEEDED',
        'SUSPICIOUS_ACTIVITY',
        'TOKEN_EXPIRED',
        'TOKEN_INVALID',
        'ACCOUNT_LOCKED',
      ],
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    sourceIp: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
  }
);

securityEventSchema.index({ timestamp: -1 });

module.exports = mongoose.model('SecurityEvent', securityEventSchema);
