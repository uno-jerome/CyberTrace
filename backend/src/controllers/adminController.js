const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ChainOfCustodyLog = require('../models/ChainOfCustodyLog');

const getAuditLogs = async (req, res) => {
  try {
    const filter = {};

    if (req.query.action) {
      filter.action = req.query.action;
    }

    if (req.query.incidentId) {
      filter.incidentId = req.query.incidentId;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.timestamp = {};
      if (req.query.startDate) {
        filter.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.timestamp.$lte = new Date(req.query.endDate);
      }
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [logs, totalLogs] = await Promise.all([
      ChainOfCustodyLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ChainOfCustodyLog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalLogs / limit);

    res.json({
      success: true,
      count: logs.length,
      page,
      totalPages,
      totalLogs,
      logs,
    });
  } catch (error) {
    console.error('[AdminController] getAuditLogs error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving audit logs.',
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'INVESTIGATOR',
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[AdminController] createUser error:', error.message);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating user.',
    });
  }
};

module.exports = { getAuditLogs, createUser };
