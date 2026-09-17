const path = require('path');
const fs = require('fs');
const EvidenceFile = require('../models/EvidenceFile');
const ChainOfCustodyLog = require('../models/ChainOfCustodyLog');
const { computeSHA256 } = require('../services/forensicService');

const verifyEvidence = async (req, res) => {
  try {
    const evidence = await EvidenceFile.findById(req.params.id);

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence file record not found.',
      });
    }

    const filePath = path.join(__dirname, '..', '..', 'uploads', evidence.storedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical evidence file is missing from the vault. This may indicate unauthorized removal.',
      });
    }

    const currentHash = await computeSHA256(filePath);
    const baselineHash = evidence.sha256Hash;
    const match = currentHash === baselineHash;
    const integrityStatus = match ? 'Verified' : 'Tampered';
    const verifiedAt = new Date().toISOString();

    evidence.integrityStatus = integrityStatus;
    await evidence.save();

    const clientIp = req.ip || req.connection.remoteAddress || '0.0.0.0';

    await ChainOfCustodyLog.create({
      evidenceId: evidence._id,
      incidentId: evidence.incidentId,
      action: match ? 'VERIFY_PASS' : 'VERIFY_FAIL',
      performedBy: req.user.name || req.user.id,
      role: req.user.role,
      ipAddress: clientIp,
      details: match
        ? `Integrity verified. SHA-256 matches baseline: ${baselineHash}`
        : `TAMPER DETECTED. Baseline: ${baselineHash} | Current: ${currentHash}`,
    });

    res.json({
      success: true,
      match,
      baselineHash,
      currentHash,
      integrityStatus,
      verifiedAt,
    });
  } catch (error) {
    console.error('[EvidenceController] Verify error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during evidence verification.',
    });
  }
};

const streamEvidenceFile = async (req, res) => {
  try {
    const evidence = await EvidenceFile.findById(req.params.id);

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence file record not found.',
      });
    }

    const filePath = path.join(__dirname, '..', '..', 'uploads', evidence.storedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical evidence file is missing from the vault.',
      });
    }

    const isDownload = req.query.disposition === 'download';
    const action = isDownload ? 'DOWNLOAD' : 'VIEW';
    const clientIp = req.ip || req.connection.remoteAddress || '0.0.0.0';

    await ChainOfCustodyLog.create({
      evidenceId: evidence._id,
      incidentId: evidence.incidentId,
      action,
      performedBy: req.user.name || req.user.id,
      role: req.user.role,
      ipAddress: clientIp,
      details: `${action} of "${evidence.originalFilename}" by ${req.user.name} (${req.user.role})`,
    });

    const dispositionType = isDownload ? 'attachment' : 'inline';
    const safeFilename = encodeURIComponent(evidence.originalFilename);

    res.setHeader('Content-Type', evidence.mimeType);
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${safeFilename}"`);
    res.setHeader('Content-Length', evidence.fileSizeBytes);

    res.sendFile(filePath);
  } catch (error) {
    console.error('[EvidenceController] Stream error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while streaming evidence file.',
    });
  }
};

module.exports = { verifyEvidence, streamEvidenceFile };
