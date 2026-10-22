const express = require('express');
const { body } = require('express-validator');
const {
  getMyCompany,
  updateCompanyProfile,
  getTeamMembers,
  inviteTeamMember,
  updateMemberRole,
  removeMember,
} = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { requirePlatformRole, requireCompanyRole } = require('../middleware/role');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// All company routes require authenticated company user
router.use(protect);
router.use(requirePlatformRole('company'));

// Get my company details
router.get('/my-company', requireCompanyRole('owner', 'hr', 'interviewer'), getMyCompany);

// Update company profile - OWNER ONLY
router.put(
  '/profile',
  requireCompanyRole('owner'),
  [
    body('name').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
    body('website').optional().trim().isURL().withMessage('Please provide a valid URL'),
  ],
  validateRequest,
  updateCompanyProfile
);

// Get team members - OWNER and HR
router.get('/members', requireCompanyRole('owner', 'hr'), getTeamMembers);

// Invite new team member - OWNER ONLY
router.post(
  '/invite',
  requireCompanyRole('owner'),
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required for team invite'),
    body('companyRole').isIn(['hr', 'interviewer']).withMessage('Role must be either hr or interviewer'),
  ],
  validateRequest,
  inviteTeamMember
);

// Update team member role - OWNER ONLY
router.patch(
  '/members/:memberId/role',
  requireCompanyRole('owner'),
  [
    body('companyRole').isIn(['hr', 'interviewer']).withMessage('Role must be either hr or interviewer'),
  ],
  validateRequest,
  updateMemberRole
);

// Remove team member - OWNER ONLY
router.delete('/members/:memberId', requireCompanyRole('owner'), removeMember);

module.exports = router;
