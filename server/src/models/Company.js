const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    verifiedStatus: {
      type: String,
      enum: ['pending', 'approved', 'blocked'],
      default: 'pending',
    },
    industry: {
      type: String,
      default: 'Technology',
    },
    companySize: {
      type: String,
      default: '11-50',
    },
    foundedYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name if not provided
companySchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
