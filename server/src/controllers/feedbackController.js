const Feedback = require('../models/Feedback');
const Application = require('../models/Application');

/**
 * @desc    Submit or update interview feedback
 * @route   POST /api/feedback
 * @access  Private (Owner, HR, Assigned Interviewer)
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { applicationId, rating, comments, recommendation } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check authorization: must be member of company
    if (req.company._id.toString() !== application.company.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this company application' });
    }

    // If interviewer, check if assigned to this application
    if (req.companyRole === 'interviewer') {
      const isAssigned = application.interviewers.some(
        (id) => id.toString() === req.user._id.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You can only submit feedback for candidate applications assigned to you',
        });
      }
    }

    const feedback = await Feedback.findOneAndUpdate(
      { application: applicationId, interviewer: req.user._id },
      {
        application: applicationId,
        interviewer: req.user._id,
        rating: Number(rating),
        comments,
        recommendation,
        submittedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('interviewer', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Interview evaluation feedback submitted successfully',
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get feedback for an application
 * @route   GET /api/feedback/application/:applicationId
 * @access  Private (Owner, HR, Interviewer)
 */
const getApplicationFeedback = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (req.company._id.toString() !== application.company.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this application' });
    }

    const query = { application: applicationId };

    // Interviewer permission: ONLY see feedback written by themselves!
    if (req.companyRole === 'interviewer') {
      query.interviewer = req.user._id;
    }

    const feedbacks = await Feedback.find(query)
      .populate('interviewer', 'name email avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getApplicationFeedback,
};
