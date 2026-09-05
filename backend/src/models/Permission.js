const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['user_management', 'role_management', 'audit', 'security', 'system', 'general'],
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Permission', permissionSchema);
