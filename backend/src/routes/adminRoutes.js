const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { getAuditLogs, createUser } = require('../controllers/adminController');

router.get('/audit-logs', verifyToken, requireRole('ADMIN'), getAuditLogs);
router.post('/users', verifyToken, requireRole('ADMIN'), createUser);

module.exports = router;
