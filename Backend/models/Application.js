const mongoose = require('mongoose');

// ─── Status History Sub-document ────────────────────────────────────────────
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
  },
  { _id: false, timestamps: true }
);

// ─── Application Schema ──────────────────────────────────────────────────────
const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    jobTitle: String,
    company: String,

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    applicantName: String,
    applicantEmail: {
      type: String,
      lowercase: true,
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    resumeUrl: String,

    status: {
      type: String,
      enum: ['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'],
      default: 'applied',
    },

    statusHistory: [statusHistorySchema],

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      maxlength: 1000,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedAt: Date,
    interviewAt: Date,
    offeredAt: Date,
    hiredAt: Date,
    rejectedAt: Date,

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// ─── Unique Constraint ───────────────────────────────────────────────────────
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// ─── Query Indexes ───────────────────────────────────────────────────────────
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });

// ─── Virtual ─────────────────────────────────────────────────────────────────
applicationSchema.virtual('isActive').get(function () {
  return !['rejected', 'hired'].includes(this.status);
});

// ─── Pre-save Middleware: Status Validation + Tracking ───────────────────────
applicationSchema.pre('save', async function (next) {
  try {
    // First-time creation
    if (this.isNew) {
      this.statusHistory.push({
        status: this.status,
        changedBy: this.applicant,
      });
      return next();
    }

    // Only when status changes
    if (this.isModified('status')) {
      const existing = await this.constructor.findById(this._id);

      const oldStatus = existing.status;
      const newStatus = this.status;

      const allowedTransitions = {
        applied: ['reviewed', 'rejected'],
        reviewed: ['shortlisted', 'rejected'],
        shortlisted: ['interview', 'rejected'],
        interview: ['offered', 'rejected'],
        offered: ['hired', 'rejected'],
        hired: [],
        rejected: [],
      };

      const allowed = allowedTransitions[oldStatus] || [];

      if (!allowed.includes(newStatus)) {
        return next(
          new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`)
        );
      }

      // Add status history
      this.statusHistory.push({
        status: newStatus,
        changedBy: this._updatedBy || existing.applicant,
      });

      // Auto timestamps based on status
      const now = new Date();

      if (newStatus === 'reviewed') this.reviewedAt = now;
      if (newStatus === 'interview') this.interviewAt = now;
      if (newStatus === 'offered') this.offeredAt = now;
      if (newStatus === 'hired') this.hiredAt = now;
      if (newStatus === 'rejected') this.rejectedAt = now;
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Application', applicationSchema);