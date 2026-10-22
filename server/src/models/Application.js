const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'],
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
});

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    resumeKey: {
      type: String,
      required: [true, 'A resume file key is required to apply'],
    },
    resumeOriginalName: {
      type: String,
      default: 'resume.pdf',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    statusHistory: [statusHistorySchema],
    interviewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Compound unique index ensuring 1 application per candidate per job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// Valid pipeline state transitions validator
applicationSchema.statics.isValidTransition = function (currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;

  const validTransitions = {
    Applied: ['Shortlisted', 'Rejected'],
    Shortlisted: ['Interview', 'Rejected'],
    Interview: ['Offer', 'Rejected'],
    Offer: ['Rejected'],
    Rejected: [], // terminal state
  };

  return validTransitions[currentStatus]?.includes(nextStatus) || false;
};

module.exports = mongoose.model('Application', applicationSchema);
