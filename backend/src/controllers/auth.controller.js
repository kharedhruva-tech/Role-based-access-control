const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const SecurityEvent = require('../models/SecurityEvent');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_access_token_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_token_key';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const generateTokens = (user, roleName, permissions) => {
  const payload = {
    userId: user._id,
    username: user.username,
    email: user.email,
    role: roleName,
    permissions,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

  return { accessToken, refreshToken };
};

// POST /api/v1/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User with this email or username already exists' },
      });
    }

    // Default to 'Employee' role for public registrations
    const employeeRole = await Role.findOne({ name: 'Employee' });
    if (!employeeRole) {
      return res.status(500).json({
        success: false,
        error: { code: 'ROLE_MISSING', message: 'Default system role not configured' },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      passwordHash,
      role: employeeRole._id,
    });

    const populatedUser = await User.findById(newUser._id).populate({
      path: 'role',
      populate: { path: 'permissions' },
    });

    const permissions = populatedUser.role.permissions.map((p) => p.name);
    const tokens = generateTokens(populatedUser, populatedUser.role.name, permissions);

    populatedUser.refreshToken = tokens.refreshToken;
    await populatedUser.save();

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: populatedUser._id,
          username: populatedUser.username,
          email: populatedUser.email,
          role: populatedUser.role.name,
          permissions,
        },
        tokens,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash +refreshToken').populate({
      path: 'role',
      populate: { path: 'permissions' },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_DISABLED', message: 'Account is deactivated. Contact Administrator.' },
      });
    }

    // Check account lockout status
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        error: { code: 'ACCOUNT_LOCKED', message: 'Account locked due to multiple failed logins. Try later.' },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        await SecurityEvent.create({
          eventType: 'ACCOUNT_LOCKED',
          severity: 'HIGH',
          sourceIp: req.ip || '127.0.0.1',
          endpoint: req.originalUrl,
          userId: user._id,
          description: `Account locked for user ${user.username} after 5 failed attempts`,
        });
      }
      await user.save();

      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // Reset login failures on success
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();

    const permissions = user.role ? user.role.permissions.map((p) => p.name) : [];
    const tokens = generateTokens(user, user.role ? user.role.name : 'Guest', permissions);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role ? user.role.name : 'Guest',
          permissions,
        },
        tokens,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// POST /api/v1/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'TOKEN_REQUIRED', message: 'Refresh token is required' },
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (e) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Expired or invalid refresh token' },
      });
    }

    const user = await User.findById(decoded.userId).select('+refreshToken').populate({
      path: 'role',
      populate: { path: 'permissions' },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_REVOKED', message: 'Refresh token has been revoked or invalidated' },
      });
    }

    const permissions = user.role ? user.role.permissions.map((p) => p.name) : [];
    const tokens = generateTokens(user, user.role ? user.role.name : 'Guest', permissions);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: { tokens },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// POST /api/v1/auth/logout
exports.logout = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User context missing' },
      });
    }

    const user = await User.findById(userId).populate({
      path: 'role',
      populate: { path: 'permissions' },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    const permissions = user.role ? user.role.permissions.map((p) => p.name) : [];

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role ? user.role.name : 'Guest',
          permissions,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};
