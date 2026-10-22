const express = require('express');
const { body, query } = require('express-validator');
const {
  getJobs,
  getJobById,
  getCompanyJobs,
  createJob,
  updateJob,
  closeJob,
  deleteJob,
} = require('../controllers/jobController');
const { applyToJob } = require('../controllers/applicationController');
const { protect, optionalAuth } = require('../middleware/auth');
const { requirePlatformRole, requireCompanyRole, requireApprovedCompany } = require('../middleware/role');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Public: Get all open jobs with keyword search & filters
router.get('/', optionalAuth, getJobs);

// Recruiter: Get company jobs (draft, open, closed)
router.get(
  '/company/all',
  protect,
  requirePlatformRole('company'),
  requireCompanyRole('owner', 'hr', 'interviewer'),
  getCompanyJobs
);

// Candidate: Apply to an open job (POST /api/jobs/:id/apply as specified in architecture)
router.post(
  '/:id/apply',
  protect,
  requirePlatformRole('candidate'),
  [
    body('coverLetter').optional().isString(),
  ],
  validateRequest,
  applyToJob
);

// Public: Get single job details
router.get('/:id', optionalAuth, getJobById);

// Recruiter: Create job (Owner or HR)
router.post(
  '/',
  protect,
  requirePlatformRole('company'),
  requireCompanyRole('owner', 'hr'),
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('description').trim().notEmpty().withMessage('Job description is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('jobType').isIn(['full-time', 'part-time', 'remote', 'contract', 'internship']).withMessage('Invalid job type'),
    body('experienceLevel').isIn(['entry', 'mid', 'senior', 'lead']).withMessage('Invalid experience level'),
  ],
  validateRequest,
  createJob
);

// Recruiter: Update job (Owner or HR)
router.put(
  '/:id',
  protect,
  requirePlatformRole('company'),
  requireCompanyRole('owner', 'hr'),
  updateJob
);

// Recruiter: Close job (Owner or HR)
router.patch(
  '/:id/close',
  protect,
  requirePlatformRole('company'),
  requireCompanyRole('owner', 'hr'),
  closeJob
);

// Recruiter Owner or Admin: Delete job
router.delete(
  '/:id',
  protect,
  deleteJob
);

module.exports = router;
