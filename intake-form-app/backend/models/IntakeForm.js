const mongoose = require('mongoose');

// Intake Form Schema
const intakeFormSchema = new mongoose.Schema(
  {
    // User/Client Reference - Links to Khalifa User ID
    userId: {
      type: String,
      required: true,
      index: true  // Index for faster queries
    },

    // Optional: Client ID (set later when admin creates client)
    clientId: {
      type: String,
      index: true
    },

    // Form Data - stored as flexible document
    formData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {}
    },

    // Metadata
    submissionId: {
      type: String,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString()
    },

    // Status tracking
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected'],
      default: 'submitted'
    },

    // Timestamps
    submittedAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    },

    // Optional client reference (if linked to Khalifa clients)
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null
    },

    // Optional notes
    notes: {
      type: String,
      default: ''
    }
  },
  {
    collection: 'intake_forms',
    timestamps: true
  }
);

// Index for faster queries
intakeFormSchema.index({ submittedAt: -1 });
intakeFormSchema.index({ status: 1 });
intakeFormSchema.index({ submissionId: 1 });

// ToJSON transform to clean up response
intakeFormSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const IntakeForm = mongoose.model('IntakeForm', intakeFormSchema);

module.exports = IntakeForm;
