const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'contract', 'internship'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead'],
      default: 'mid',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'closed'],
      default: 'draft',
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// MongoDB text index for full-text search with relevance scoring
jobSchema.index(
  {
    title: 'text',
    description: 'text',
    skills: 'text',
  },
  {
    weights: {
      title: 10,
      skills: 5,
      description: 1,
    },
    name: 'JobTextIndex',
  }
);

// Additional composite indexes for fast filtering
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ jobType: 1, experienceLevel: 1, salaryMin: 1 });

module.exports = mongoose.model('Job', jobSchema);
