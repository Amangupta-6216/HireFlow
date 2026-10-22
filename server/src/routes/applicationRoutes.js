const express = require('express');
const { body } = require('express-validator');
const {
  getCandidateApplications,
  getJobApplicants,
  updateApplicationStatus,
  assignInterviewers,
  getApplicationResumeSignedUrl,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { requirePlatformRole, requireCompanyRole } = require('../middleware/role');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

// Candidate: Get all my submitted applications
router.get(
  '/my-applications',
  requirePlatformRole('candidate'),
  getCandidateApplications
);

// Recruiter: Get applicants for a job (or all company applicants)
// Interviewer gets filtered results (only assigned applicants)
router.get(
  '/job/:jobId',
  requirePlatformRole('company'),
  requireCompanyRole('owner', 'hr', 'interviewer'),
  getJobApplicants
);

// Recruiter: Move candidate through pipeline (Applied -> Shortlisted -> Interview -> Offer/Rejected)
// Owner or HR only! (Interviewer cannot update status)
router.patch(
  '/:id/status',
  requirePlatformRole('company'),
  requireCompanyRole('owner', 'hr'),
  [
    body('status')
      .isIn(['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'])
      .withMessage('Invalid application status'),
  ],
  validateRequest,
  updateApplicationStatus
);

// Recruiter: Assign interviewer(s) to application
// Owner or HR only!
router.patch(
  '/:id/assign-interviewers',
  requirePlatformRole('company'),
  requireCompanyRole('owner', 'hr'),
  [
    body('interviewerIds').isArray().withMessage('interviewerIds must be an array of user IDs'),
  ],
  validateRequest,
  assignInterviewers
);

// Recruiter or Candidate: Generate short-lived signed URL for resume
router.get(
  '/:id/resume-url',
  getApplicationResumeSignedUrl
);

module.exports = router;
