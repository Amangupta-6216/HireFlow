const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating (1 to 5) is required'],
    },
    comments: {
      type: String,
      required: [true, 'Interview evaluation comments are required'],
      trim: true,
    },
    recommendation: {
      type: String,
      enum: ['strong_yes', 'yes', 'neutral', 'no', 'strong_no'],
      required: [true, 'A recommendation is required'],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique feedback per application per interviewer
feedbackSchema.index({ application: 1, interviewer: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
