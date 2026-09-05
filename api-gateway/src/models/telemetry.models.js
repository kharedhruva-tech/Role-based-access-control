const mongoose = require('mongoose');

const telemetrySchemaOptions = {
  strict: false,
  timestamps: { createdAt: 'timestamp', updatedAt: false },
};

const registerTelemetryModels = () => {
  if (!mongoose.models.SecurityEvent) {
    mongoose.model('SecurityEvent', new mongoose.Schema({}, { ...telemetrySchemaOptions, collection: 'securityevents' }));
  }
  if (!mongoose.models.ApiRequest) {
    mongoose.model('ApiRequest', new mongoose.Schema({}, { ...telemetrySchemaOptions, collection: 'apirequests' }));
  }
  if (!mongoose.models.AuditLog) {
    mongoose.model('AuditLog', new mongoose.Schema({}, { ...telemetrySchemaOptions, collection: 'auditlogs' }));
  }
};

module.exports = registerTelemetryModels;
