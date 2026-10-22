const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    companyRole: {
      type: String,
      enum: ['owner', 'hr', 'interviewer'],
      required: true,
      default: 'interviewer',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index: a user can have at most one membership per company
membershipSchema.index({ user: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Membership', membershipSchema);
