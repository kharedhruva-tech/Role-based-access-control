const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 5001;

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Import Route Handlers
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const permissionRoutes = require('./routes/permission.routes');
const auditRoutes = require('./routes/audit.routes');
const securityRoutes = require('./routes/security.routes');

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/security', securityRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Backend Microservice',
    timestamp: new Date().toISOString(),
  });
});

// Root API test route
app.get('/api/v1/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend Microservice operational',
    version: '1.0.0',
  });
});

// Start Server after connecting to MongoDB
const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`[Backend Service] Running on http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[Backend Service] Port ${PORT} is already in use. Reusing the existing service.`);
      process.exit(0);
    }

    console.error('[Backend Service Startup Failed]', error.message);
    process.exit(1);
  });
};

startServer();
