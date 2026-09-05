const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure_rbac_gateway';
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected Successfully: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Error] Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
