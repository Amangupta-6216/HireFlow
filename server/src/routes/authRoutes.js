const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  refresh,
  logout,
  getMe,
  acceptInvite,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Register with validation & rate limit
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .optional()
      .isIn(['candidate', 'company'])
      .withMessage('Role must be candidate or company'),
    body('companyName')
      .if(body('role').equals('company'))
      .trim()
      .notEmpty()
      .withMessage('Company name is required for recruiter registration'),
  ],
  validateRequest,
  register
);

// Login with validation & rate limit
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  login
);

// Refresh access token (reads cookie)
router.post('/refresh', refresh);

// Logout (clears cookie)
router.post('/logout', logout);

// Get current logged-in user profile
router.get('/me', protect, getMe);

// Accept team invite
router.post(
  '/accept-invite',
  [
    body('token').notEmpty().withMessage('Invitation token is required'),
  ],
  validateRequest,
  acceptInvite
);

// Forgot password request (sends reset email)
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')],
  validateRequest,
  forgotPassword
);

// Reset password with token
router.put(
  '/reset-password/:token',
  authLimiter,
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  validateRequest,
  resetPassword
);

module.exports = router;
