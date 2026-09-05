const AuditLog = require('../models/AuditLog');

// GET /api/v1/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, status, userId, limit = 50, page = 1 } = req.query;

    const query = {};
    if (action) query.action = action;
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const logs = await AuditLog.find(query)
      .populate('userId', 'username email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
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
