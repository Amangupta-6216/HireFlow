const express = require('express');
const { body } = require('express-validator');
const {
  getPlatformStats,
  getAllCompanies,
  updateCompanyStatus,
  getAllJobs,
  deleteJob,
  getAllUsers,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requirePlatformRole } = require('../middleware/role');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

router.use(protect);
router.use(requirePlatformRole('admin'));

// Platform stats
router.get('/stats', getPlatformStats);

// Company approvals & moderation
router.get('/companies', getAllCompanies);
router.patch(
  '/companies/:id/status',
  [
    body('status')
      .isIn(['approved', 'blocked', 'pending'])
      .withMessage("Status must be 'approved', 'blocked', or 'pending'"),
  ],
  validateRequest,
  updateCompanyStatus
);

// Job moderation
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', deleteJob);

// Platform user listings
router.get('/users', getAllUsers);

module.exports = router;
