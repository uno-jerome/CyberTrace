const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { verifyEvidence, streamEvidenceFile } = require('../controllers/evidenceController');

router.post('/:id/verify', verifyToken, verifyEvidence);
router.get('/:id/file', verifyToken, streamEvidenceFile);

module.exports = router;
