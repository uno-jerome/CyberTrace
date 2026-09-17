const mongoose = require('mongoose');

const evidenceFileSchema = new mongoose.Schema(
  {
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      required: [true, 'Incident ID is required'],
      index: true,
    },
    originalFilename: {
      type: String,
      required: [true, 'Original filename is required'],
    },
    storedFilename: {
      type: String,
      required: [true, 'Stored filename (UUID) is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    fileSizeBytes: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
    },
    sha256Hash: {
      type: String,
      required: [true, 'SHA-256 hash is required'],
      index: true,
    },
    md5Hash: {
      type: String,
      required: [true, 'MD5 hash is required'],
    },
    integrityStatus: {
      type: String,
      enum: {
        values: ['Verified', 'Tampered', 'Unchecked'],
        message: '{VALUE} is not a valid integrity status',
      },
      default: 'Unchecked',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const EvidenceFile = mongoose.model('EvidenceFile', evidenceFileSchema);

module.exports = EvidenceFile;
