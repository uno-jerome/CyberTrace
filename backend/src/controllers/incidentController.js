const Incident = require('../models/Incident');
const EvidenceFile = require('../models/EvidenceFile');
const ChainOfCustodyLog = require('../models/ChainOfCustodyLog');
const { computeFileHashes } = require('../services/forensicService');
const { generateDossierPDF } = require('../utils/pdfGenerator');

const generateTrackingId = async () => {
  const year = new Date().getFullYear();
  const count = await Incident.countDocuments();
  const padded = String(count + 1).padStart(5, '0');
  return `CASE-${year}-${padded}`;
};

const submitPublicIncident = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      incidentDate,
      complainantName,
      complainantContact,
      platform,
      suspectIdentifiers,
      estimatedLoss,
    } = req.body;

    if (!title || !category || !description || !incidentDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, category, description, and incidentDate are mandatory.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'An evidence file is required. Upload a file using the "evidence" field.',
      });
    }

    const trackingId = await generateTrackingId();

    const incident = await Incident.create({
      trackingId,
      title,
      category,
      description,
      incidentDate: new Date(incidentDate),
      complainantName: complainantName || 'Anonymous',
      complainantContact: complainantContact || 'N/A',
      platform: platform || '',
      suspectIdentifiers: suspectIdentifiers || '',
      estimatedLoss: estimatedLoss ? Number(estimatedLoss) : 0,
    });

    const { sha256, md5 } = await computeFileHashes(req.file.path);

    const evidenceFile = await EvidenceFile.create({
      incidentId: incident._id,
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      mimeType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      sha256Hash: sha256,
      md5Hash: md5,
      integrityStatus: 'Unchecked',
    });

    const clientIp = req.ip || req.connection.remoteAddress || '0.0.0.0';

    await ChainOfCustodyLog.create({
      evidenceId: evidenceFile._id,
      incidentId: incident._id,
      action: 'INGESTION',
      performedBy: 'PUBLIC_ANONYMOUS',
      role: 'CITIZEN',
      ipAddress: clientIp,
      details: `Evidence "${req.file.originalname}" ingested. SHA-256: ${sha256}`,
    });

    res.status(201).json({
      success: true,
      trackingId: incident.trackingId,
    });
  } catch (error) {
    console.error('[IncidentController] Submit error:', error.message);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while processing incident submission.',
    });
  }
};

const trackIncident = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const incident = await Incident.findOne({ trackingId }).lean();

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: `No incident found with tracking ID "${trackingId}".`,
      });
    }

    const statusStages = ['Reported', 'Under Review', 'Investigating', 'Resolved', 'Closed'];
    let currentStageIndex = statusStages.indexOf(incident.status);
    if (currentStageIndex === -1 && incident.status === 'Under Triage') {
      currentStageIndex = statusStages.indexOf('Under Review');
    }
    const displayStatus = incident.status === 'Under Triage' ? 'Under Review' : incident.status;

    res.json({
      success: true,
      incident: {
        trackingId: incident.trackingId,
        title: incident.title,
        category: incident.category,
        description: incident.description,
        incidentDate: incident.incidentDate,
        complainantName: incident.complainantName,
        status: displayStatus,
        priority: incident.priority,
        createdAt: incident.createdAt,
        updatedAt: incident.updatedAt,
        timeline: {
          stages: statusStages,
          currentStage: currentStageIndex,
        },
      },
    });
  } catch (error) {
    console.error('[IncidentController] Track error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving incident status.',
    });
  }
};

const getCases = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    const incidents = await Incident.find(filter)
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error('[IncidentController] getCases error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving cases.',
    });
  }
};

const getCaseById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .lean();

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Case not found.',
      });
    }

    const evidence = await EvidenceFile.find({ incidentId: incident._id })
      .sort({ uploadedAt: -1 })
      .lean();

    const custodyTimeline = await ChainOfCustodyLog.find({ incidentId: incident._id })
      .sort({ timestamp: 1 })
      .lean();

    res.json({
      success: true,
      incident,
      evidence,
      custodyTimeline,
    });
  } catch (error) {
    console.error('[IncidentController] getCaseById error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving case details.',
    });
  }
};

const updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Under Review', 'Under Triage', 'Investigating', 'Resolved', 'Closed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}.`,
      });
    }

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Case not found.',
      });
    }

    const previousStatus = incident.status;
    incident.status = status;
    await incident.save();

    const evidence = await EvidenceFile.findOne({ incidentId: incident._id });
    const clientIp = req.ip || req.connection.remoteAddress || '0.0.0.0';

    if (evidence) {
      await ChainOfCustodyLog.create({
        evidenceId: evidence._id,
        incidentId: incident._id,
        action: 'STATUS_CHANGE',
        performedBy: req.user.name || req.user.id,
        role: req.user.role,
        ipAddress: clientIp,
        details: `Status changed from "${previousStatus}" to "${status}"`,
      });
    }

    res.json({
      success: true,
      incident,
    });
  } catch (error) {
    console.error('[IncidentController] updateCaseStatus error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating case status.',
    });
  }
};

const addCaseNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required.',
      });
    }

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Case not found.',
      });
    }

    incident.notes.push({
      author: req.user.name || req.user.id,
      text: text.trim(),
      date: new Date(),
    });

    await incident.save();

    res.status(201).json({
      success: true,
      incident,
    });
  } catch (error) {
    console.error('[IncidentController] addCaseNote error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while adding note.',
    });
  }
};

const exportDossier = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .lean();

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Case not found.',
      });
    }

    const evidence = await EvidenceFile.find({ incidentId: incident._id })
      .sort({ uploadedAt: -1 })
      .lean();

    const custodyTimeline = await ChainOfCustodyLog.find({ incidentId: incident._id })
      .sort({ timestamp: 1 })
      .lean();

    const filename = `CyberTrace_Dossier_${incident.trackingId}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    generateDossierPDF(incident, evidence, custodyTimeline, res);
  } catch (error) {
    console.error('[IncidentController] exportDossier error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while generating dossier PDF.',
    });
  }
};

module.exports = {
  submitPublicIncident,
  trackIncident,
  getCases,
  getCaseById,
  updateCaseStatus,
  addCaseNote,
  exportDossier,
};
