const mongoose = require('mongoose');

const chainOfCustodyLogSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EvidenceFile',
      required: [true, 'Evidence ID is required'],
      index: true,
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      required: [true, 'Incident ID is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: {
        values: [
          'INGESTION',
          'VIEW',
          'DOWNLOAD',
          'VERIFY_PASS',
          'VERIFY_FAIL',
          'STATUS_CHANGE',
        ],
        message: '{VALUE} is not a valid CoC action',
      },
    },
    performedBy: {
      type: String,
      required: [true, 'Performer identity is required'],
    },
    role: {
      type: String,
      required: [true, 'Performer role is required'],
      enum: {
        values: ['CITIZEN', 'INVESTIGATOR', 'ADMIN'],
        message: '{VALUE} is not a valid role',
      },
    },
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
    },
    details: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// ── Immutability Guards ───────────────────────────────────────
// ChainOfCustodyLog is STRICTLY append-only. These pre-hooks
// block any attempt to update or delete existing records,
// preserving forensic integrity of the audit trail.

const IMMUTABILITY_ERROR =
  'ChainOfCustodyLog is immutable (append-only). Update and delete operations are forbidden.';

chainOfCustodyLogSchema.pre('updateOne', function () {
  throw new Error(IMMUTABILITY_ERROR);
});

chainOfCustodyLogSchema.pre('updateMany', function () {
  throw new Error(IMMUTABILITY_ERROR);
});

chainOfCustodyLogSchema.pre('findOneAndUpdate', function () {
  throw new Error(IMMUTABILITY_ERROR);
});

chainOfCustodyLogSchema.pre('deleteOne', function () {
  throw new Error(IMMUTABILITY_ERROR);
});

chainOfCustodyLogSchema.pre('findOneAndDelete', function () {
  throw new Error(IMMUTABILITY_ERROR);
});

chainOfCustodyLogSchema.pre('deleteMany', function () {
  throw new Error(IMMUTABILITY_ERROR);
});

const ChainOfCustodyLog = mongoose.model('ChainOfCustodyLog', chainOfCustodyLogSchema);

module.exports = ChainOfCustodyLog;
