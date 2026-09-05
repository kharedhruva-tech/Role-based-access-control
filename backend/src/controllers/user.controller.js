const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

// GET /api/v1/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate({
        path: 'role',
        populate: { path: 'permissions' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// GET /api/v1/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: 'role',
      populate: { path: 'permissions' },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// POST /api/v1/users
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, roleId } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'Username or email already exists' },
      });
    }

    const roleObj = await Role.findById(roleId);
    if (!roleObj) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: 'Target role does not exist' },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      passwordHash,
      role: roleId,
    });

    const populated = await User.findById(newUser._id).populate('role');

    res.status(201).json({
      success: true,
      data: { user: populated },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// PUT /api/v1/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { username, email, roleId, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    if (roleId) {
      const roleExists = await Role.findById(roleId);
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_ROLE', message: 'Role does not exist' },
        });
      }
      user.role = roleId;
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(user._id).populate('role');

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// DELETE /api/v1/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};
