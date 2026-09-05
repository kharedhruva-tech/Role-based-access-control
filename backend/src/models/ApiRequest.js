const mongoose = require('mongoose');

const apiRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    responseTimeMs: {
      type: Number,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
  }
);

apiRequestSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ApiRequest', apiRequestSchema);
