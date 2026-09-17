const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const {
  getCases,
  getCaseById,
  updateCaseStatus,
  addCaseNote,
  exportDossier,
} = require('../controllers/incidentController');

router.get('/', verifyToken, requireRole('INVESTIGATOR', 'ADMIN'), getCases);
router.get('/:id', verifyToken, requireRole('INVESTIGATOR', 'ADMIN'), getCaseById);
router.patch('/:id/status', verifyToken, requireRole('INVESTIGATOR', 'ADMIN'), updateCaseStatus);
router.post('/:id/notes', verifyToken, requireRole('INVESTIGATOR', 'ADMIN'), addCaseNote);
router.get('/:id/export-dossier', verifyToken, requireRole('INVESTIGATOR', 'ADMIN'), exportDossier);

module.exports = router;
