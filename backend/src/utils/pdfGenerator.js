const PDFDocument = require('pdfkit');

const generateDossierPDF = (incident, evidence, custodyTimeline, res) => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: false,
    info: {
      Title: `CyberTrace Dossier — ${incident.trackingId}`,
      Author: 'CyberTrace Digital Forensic System',
      Subject: `Case ${incident.trackingId}`,
      Creator: 'CyberTrace PDFKit Generator',
    },
  });

  doc.pipe(res);

  const PAGE_WIDTH = doc.page.width - 100;

  // ── Helper: draw a horizontal rule ──────────────────────────
  const drawRule = () => {
    doc
      .strokeColor('#444444')
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(50 + PAGE_WIDTH, doc.y)
      .stroke();
    doc.moveDown(0.5);
  };

  // ── Helper: section title ───────────────────────────────────
  const sectionTitle = (title) => {
    doc.moveDown(0.8);
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('#1a1a2e')
      .text(title, { underline: true });
    doc.moveDown(0.4);
  };

  // ── Helper: key-value pair ──────────────────────────────────
  const kvPair = (key, value) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor('#333333')
      .text(`${key}: `, { continued: true })
      .font('Helvetica')
      .fillColor('#000000')
      .text(String(value || 'N/A'));
  };

  // ── Helper: check page space remaining ──────────────────────
  const ensureSpace = (needed) => {
    if (doc.y + needed > doc.page.height - 60) {
      doc.addPage();
    }
  };

  // ──────────────────────────────────────────────────────────────
  //  PAGE 1: OFFICIAL HEADER + INCIDENT METADATA
  // ──────────────────────────────────────────────────────────────

  // Official header block
  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor('#0f0f23')
    .text('CYBERTRACE', { align: 'center' });
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#444444')
    .text('Digital Forensic Case & Incident Management System', { align: 'center' });
  doc.moveDown(0.3);
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#1a1a2e')
    .text('FORENSIC CASE DOSSIER', { align: 'center' });
  doc.moveDown(0.2);
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#666666')
    .text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
  doc.moveDown(0.5);
  drawRule();

  // Classification banner
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#cc0000')
    .text('CLASSIFICATION: LAW ENFORCEMENT SENSITIVE — FOR OFFICIAL USE ONLY', { align: 'center' });
  doc.moveDown(0.5);
  drawRule();

  // Incident metadata section
  sectionTitle('1. Incident Metadata');
  kvPair('Tracking ID', incident.trackingId);
  kvPair('Title', incident.title);
  kvPair('Category', incident.category);
  kvPair('Status', incident.status);
  kvPair('Priority', incident.priority);
  kvPair('Incident Date', incident.incidentDate ? new Date(incident.incidentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A');
  kvPair('Date Filed', incident.createdAt ? new Date(incident.createdAt).toISOString() : 'N/A');
  kvPair('Last Updated', incident.updatedAt ? new Date(incident.updatedAt).toISOString() : 'N/A');

  doc.moveDown(0.5);
  sectionTitle('2. Complainant Information');
  kvPair('Name', incident.complainantName);
  kvPair('Contact', incident.complainantContact);

  // Assigned investigator
  if (incident.assignedTo) {
    doc.moveDown(0.3);
    kvPair('Assigned Investigator', incident.assignedTo.name || incident.assignedTo.email || 'Unassigned');
  }

  // Description
  doc.moveDown(0.5);
  sectionTitle('3. Incident Description');
  doc
    .font('Helvetica')
    .fontSize(9.5)
    .fillColor('#000000')
    .text(incident.description || 'No description provided.', {
      width: PAGE_WIDTH,
      align: 'justify',
    });

  // ──────────────────────────────────────────────────────────────
  //  EVIDENCE MANIFEST
  // ──────────────────────────────────────────────────────────────
  ensureSpace(120);
  sectionTitle('4. Evidence Manifest');

  if (evidence.length === 0) {
    doc.font('Helvetica').fontSize(9.5).text('No evidence files associated with this case.');
  } else {
    evidence.forEach((ev, index) => {
      ensureSpace(100);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#1a1a2e')
        .text(`Evidence #${index + 1}`);
      doc.moveDown(0.2);

      kvPair('Original Filename', ev.originalFilename);
      kvPair('Disk UUID Name', ev.storedFilename);
      kvPair('MIME Type', ev.mimeType);
      kvPair('File Size', `${(ev.fileSizeBytes / 1024).toFixed(2)} KB (${ev.fileSizeBytes} bytes)`);
      kvPair('SHA-256 Hash', ev.sha256Hash);
      kvPair('MD5 Hash', ev.md5Hash);
      kvPair('Integrity Status', ev.integrityStatus);
      kvPair('Uploaded At', ev.uploadedAt ? new Date(ev.uploadedAt).toISOString() : 'N/A');

      doc.moveDown(0.5);
      drawRule();
    });
  }

  // ──────────────────────────────────────────────────────────────
  //  CHAIN OF CUSTODY AUDIT LEDGER
  // ──────────────────────────────────────────────────────────────
  ensureSpace(100);
  sectionTitle('5. Chain of Custody Audit Ledger');

  if (custodyTimeline.length === 0) {
    doc.font('Helvetica').fontSize(9.5).text('No chain of custody entries recorded.');
  } else {
    // Table header
    const COL_WIDTHS = {
      num: 25,
      timestamp: 130,
      action: 85,
      performer: 105,
      role: 70,
      ip: 80,
    };

    const drawTableHeader = () => {
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#ffffff');

      const headerY = doc.y;
      doc
        .rect(50, headerY - 2, PAGE_WIDTH, 16)
        .fill('#1a1a2e');

      doc.fillColor('#ffffff');
      let x = 52;
      doc.text('#', x, headerY + 1, { width: COL_WIDTHS.num });
      x += COL_WIDTHS.num;
      doc.text('Timestamp', x, headerY + 1, { width: COL_WIDTHS.timestamp });
      x += COL_WIDTHS.timestamp;
      doc.text('Action', x, headerY + 1, { width: COL_WIDTHS.action });
      x += COL_WIDTHS.action;
      doc.text('Performed By', x, headerY + 1, { width: COL_WIDTHS.performer });
      x += COL_WIDTHS.performer;
      doc.text('Role', x, headerY + 1, { width: COL_WIDTHS.role });
      x += COL_WIDTHS.role;
      doc.text('IP Address', x, headerY + 1, { width: COL_WIDTHS.ip });

      doc.y = headerY + 18;
    };

    drawTableHeader();

    custodyTimeline.forEach((entry, index) => {
      ensureSpace(35);

      // Alternate row shading
      if (index % 2 === 0) {
        doc
          .rect(50, doc.y - 1, PAGE_WIDTH, 13)
          .fill('#f5f5f5');
      }

      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor('#000000');

      const rowY = doc.y;
      let x = 52;

      doc.text(String(index + 1), x, rowY + 1, { width: COL_WIDTHS.num });
      x += COL_WIDTHS.num;
      doc.text(entry.timestamp ? new Date(entry.timestamp).toISOString() : 'N/A', x, rowY + 1, { width: COL_WIDTHS.timestamp });
      x += COL_WIDTHS.timestamp;
      doc.text(entry.action, x, rowY + 1, { width: COL_WIDTHS.action });
      x += COL_WIDTHS.action;
      doc.text(entry.performedBy || 'N/A', x, rowY + 1, { width: COL_WIDTHS.performer });
      x += COL_WIDTHS.performer;
      doc.text(entry.role || 'N/A', x, rowY + 1, { width: COL_WIDTHS.role });
      x += COL_WIDTHS.role;
      doc.text(entry.ipAddress || 'N/A', x, rowY + 1, { width: COL_WIDTHS.ip });

      doc.y = rowY + 14;

      // Print details line if present
      if (entry.details) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(7)
          .fillColor('#555555')
          .text(`   → ${entry.details}`, 52, doc.y, { width: PAGE_WIDTH - 4 });
        doc.moveDown(0.15);
      }
    });
  }

  // ── Internal Notes ──────────────────────────────────────────
  if (incident.notes && incident.notes.length > 0) {
    ensureSpace(80);
    sectionTitle('6. Internal Investigator Notes');

    incident.notes.forEach((note, index) => {
      ensureSpace(40);
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#333333')
        .text(`[${index + 1}] ${note.author} — ${note.date ? new Date(note.date).toISOString() : 'N/A'}`);
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#000000')
        .text(note.text, { width: PAGE_WIDTH, indent: 10 });
      doc.moveDown(0.4);
    });
  }

  // ── Footer / Certification ──────────────────────────────────
  ensureSpace(60);
  doc.moveDown(1);
  drawRule();
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#444444')
    .text('END OF DOSSIER', { align: 'center' });
  doc.moveDown(0.3);
  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor('#666666')
    .text(
      'This document was generated programmatically by CyberTrace. ' +
      'All hash values were computed using SHA-256 and MD5 algorithms via Node.js native crypto streams. ' +
      'The Chain of Custody ledger is append-only and cannot be modified or deleted after creation.',
      { align: 'center', width: PAGE_WIDTH }
    );

  doc.end();
};

module.exports = { generateDossierPDF };
