const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { submitPublicIncident, trackIncident } = require('../controllers/incidentController');

router.post('/public', upload.single('evidence'), submitPublicIncident);
router.get('/track/:trackingId', trackIncident);

module.exports = router;
