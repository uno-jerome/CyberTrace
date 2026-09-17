const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: [true, 'Note author is required'],
    },
    text: {
      type: String,
      required: [true, 'Note text is required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const incidentSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: [true, 'Tracking ID is required'],
      unique: true,
      index: true,
      match: [/^CASE-\d{4}-\d{5}$/, 'Tracking ID must follow CASE-YYYY-XXXXX format'],
    },
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Phishing',
          'Financial Fraud',
          'Extortion',
          'Identity Theft',
          'Unauthorized Access',
        ],
        message: '{VALUE} is not a valid category',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    incidentDate: {
      type: Date,
      required: [true, 'Incident date is required'],
    },
    complainantName: {
      type: String,
      default: 'Anonymous',
      trim: true,
    },
    complainantContact: {
      type: String,
      default: 'N/A',
      trim: true,
    },
    platform: {
      type: String,
      trim: true,
      default: '',
    },
    suspectIdentifiers: {
      type: String,
      trim: true,
      default: '',
    },
    estimatedLoss: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['Reported', 'Under Review', 'Under Triage', 'Investigating', 'Resolved', 'Closed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Reported',
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: [noteSchema],
  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;
