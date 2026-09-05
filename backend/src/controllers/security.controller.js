const SecurityEvent = require('../models/SecurityEvent');
const ApiRequest = require('../models/ApiRequest');
const User = require('../models/User');

// GET /api/v1/security/events
exports.getSecurityEvents = async (req, res) => {
  try {
    const { severity, eventType, limit = 50 } = req.query;

    const query = {};
    if (severity) query.severity = severity;
    if (eventType) query.eventType = eventType;

    const events = await SecurityEvent.find(query)
      .populate('userId', 'username email role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: events.length,
      data: { events },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// GET /api/v1/security/metrics
exports.getSecurityMetrics = async (req, res) => {
  try {
    const totalRequests = await ApiRequest.countDocuments();
    const successfulRequests = await ApiRequest.countDocuments({ statusCode: { $gte: 200, $lt: 300 } });
    const failedRequests = await ApiRequest.countDocuments({ statusCode: { $gte: 400 } });
    const authFailures = await ApiRequest.countDocuments({ statusCode: 401 });
    const authzFailures = await ApiRequest.countDocuments({ statusCode: 403 });
    const rateLimitViolations = await ApiRequest.countDocuments({ statusCode: 429 });

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Aggregate users by role
    const usersByRole = await User.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'roleInfo',
        },
      },
      { $unwind: '$roleInfo' },
      {
        $group: {
          _id: '$roleInfo.name',
          count: { $sum: 1 },
        },
      },
    ]);

    // Hourly request breakdown for live monitoring chart
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hourlyTraffic = await ApiRequest.aggregate([
      { $match: { timestamp: { $gte: last24Hours } } },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          total: { $sum: 1 },
          authFailures: {
            $sum: { $cond: [{ $eq: ['$statusCode', 401] }, 1, 0] },
          },
          forbidden: {
            $sum: { $cond: [{ $eq: ['$statusCode', 403] }, 1, 0] },
          },
          rateLimited: {
            $sum: { $cond: [{ $eq: ['$statusCode', 429] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRequests,
          successfulRequests,
          failedRequests,
          authFailures,
          authzFailures,
          rateLimitViolations,
          totalUsers,
          activeUsers,
        },
        usersByRole,
        hourlyTraffic,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};
