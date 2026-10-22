const express = require('express');
const { body } = require('express-validator');
const {
  submitFeedback,
  getApplicationFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
const { requirePlatformRole, requireCompanyRole } = require('../middleware/role');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

router.use(protect);
router.use(requirePlatformRole('company'));

// Submit feedback (Interviewer, HR, or Owner)
router.post(
  '/',
  requireCompanyRole('owner', 'hr', 'interviewer'),
  [
    body('applicationId').notEmpty().withMessage('applicationId is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5'),
    body('comments').trim().notEmpty().withMessage('Evaluation comments are required'),
    body('recommendation')
      .isIn(['strong_yes', 'yes', 'neutral', 'no', 'strong_no'])
      .withMessage('Valid recommendation is required'),
  ],
  validateRequest,
  submitFeedback
);

// Get application feedback (Interviewer sees only their own; HR/Owner see all)
router.get(
  '/application/:applicationId',
  requireCompanyRole('owner', 'hr', 'interviewer'),
  getApplicationFeedback
);

module.exports = router;
