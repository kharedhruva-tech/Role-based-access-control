const Role = require('../models/Role');
const Permission = require('../models/Permission');

// GET /api/v1/roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions').sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: roles.length,
      data: { roles },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// POST /api/v1/roles
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(409).json({
        success: false,
        error: { code: 'ROLE_EXISTS', message: `Role '${name}' already exists` },
      });
    }

    const newRole = await Role.create({
      name,
      description,
      permissions: permissionIds || [],
      isSystemRole: false,
    });

    const populated = await Role.findById(newRole._id).populate('permissions');

    res.status(201).json({
      success: true,
      data: { role: populated },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// PUT /api/v1/roles/:id
exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Role not found' },
      });
    }

    if (name) role.name = name;
    if (description) role.description = description;
    if (permissionIds) role.permissions = permissionIds;

    await role.save();

    const updated = await Role.findById(role._id).populate('permissions');

    res.status(200).json({
      success: true,
      data: { role: updated },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// DELETE /api/v1/roles/:id
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Role not found' },
      });
    }

    if (role.isSystemRole) {
      return res.status(403).json({
        success: false,
        error: { code: 'SYSTEM_ROLE_PROTECTED', message: 'System defined default roles cannot be deleted' },
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// GET /api/v1/permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ category: 1, name: 1 });
    res.status(200).json({
      success: true,
      count: permissions.length,
      data: { permissions },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};
