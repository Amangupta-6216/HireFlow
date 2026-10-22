const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const Membership = require('../models/Membership');
const Invite = require('../models/Invite');
const CandidateProfile = require('../models/CandidateProfile');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require('../utils/tokens');
const { sendEmail } = require('../config/mailer');
const { welcomeEmail, passwordResetEmail } = require('../utils/emailTemplates');

/**
 * @desc    Register a new user (candidate or company owner)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'candidate', companyName, companyWebsite } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role === 'company' ? 'company' : 'candidate',
    });

    let company = null;
    let membership = null;

    if (user.role === 'candidate') {
      // Initialize candidate profile
      await CandidateProfile.create({ user: user._id });
    } else if (user.role === 'company') {
      // Create pending company and owner membership
      company = await Company.create({
        name: companyName || `${user.name}'s Company`,
        website: companyWebsite || '',
        verifiedStatus: 'pending',
        createdBy: user._id,
      });

      membership = await Membership.create({
        user: user._id,
        company: company._id,
        companyRole: 'owner',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      id: user._id,
    });

    // Send welcome email asynchronously
    const welcome = welcomeEmail(user.name);
    sendEmail({ to: user.email, ...welcome }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. Please sign in with your credentials.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check company membership if company role
    let companyData = null;
    if (user.role === 'company') {
      const membership = await Membership.findOne({ user: user._id, status: 'active' }).populate('company');
      if (membership && membership.company) {
        companyData = {
          id: membership.company._id,
          name: membership.company.name,
          verifiedStatus: membership.company.verifiedStatus,
          role: membership.companyRole,
        };
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      id: user._id,
    });

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      company: companyData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token using httpOnly cookie
 * @route   POST /api/auth/refresh
 * @access  Public (via cookie)
 */
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token cookie missing',
        code: 'REFRESH_TOKEN_MISSING',
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid. Please log in again.',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    let companyData = null;
    if (user.role === 'company') {
      const membership = await Membership.findOne({ user: user._id, status: 'active' }).populate('company');
      if (membership && membership.company) {
        companyData = {
          id: membership.company._id,
          name: membership.company.name,
          verifiedStatus: membership.company.verifiedStatus,
          role: membership.companyRole,
        };
      }
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      company: companyData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log user out & clear refresh cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  clearRefreshTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @desc    Get current logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let companyData = null;
    let profileData = null;

    if (user.role === 'company') {
      const membership = await Membership.findOne({ user: user._id, status: 'active' }).populate('company');
      if (membership && membership.company) {
        companyData = {
          id: membership.company._id,
          name: membership.company.name,
          verifiedStatus: membership.company.verifiedStatus,
          role: membership.companyRole,
        };
      }
    } else if (user.role === 'candidate') {
      profileData = await CandidateProfile.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      company: companyData,
      profile: profileData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept company team invitation
 * @route   POST /api/auth/accept-invite
 * @access  Public
 */
const acceptInvite = async (req, res, next) => {
  try {
    const { token, name, password } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const invite = await Invite.findOne({
      tokenHash,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).populate('company');

    if (!invite) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invitation link',
      });
    }

    let user = await User.findOne({ email: invite.email });
    if (!user) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to set up your account',
        });
      }
      user = await User.create({
        name: name || invite.email.split('@')[0],
        email: invite.email,
        password,
        role: 'company',
      });
    } else {
      user.role = 'company';
      await user.save();
    }

    // Create or activate membership
    let membership = await Membership.findOne({ user: user._id, company: invite.company._id });
    if (membership) {
      membership.companyRole = invite.companyRole;
      membership.status = 'active';
      await membership.save();
    } else {
      membership = await Membership.create({
        user: user._id,
        company: invite.company._id,
        companyRole: invite.companyRole,
        status: 'active',
      });
    }

    // Mark invite accepted
    invite.status = 'accepted';
    await invite.save();

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ id: user._id });
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: `You have successfully joined ${invite.company.name} as an ${invite.companyRole.toUpperCase()}`,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      company: {
        id: invite.company._id,
        name: invite.company.name,
        verifiedStatus: invite.company.verifiedStatus,
        role: invite.companyRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request password reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Neutral response to prevent account enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate random reset token (32 bytes = 64 hex chars)
    const rawResetToken = crypto.randomBytes(32).toString('hex');

    // Hash token using SHA-256 and save to database
    user.passwordResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${rawResetToken}`;

    // Send email asynchronously
    const emailData = passwordResetEmail(user.name, resetUrl);
    sendEmail({ to: user.email, ...emailData }).catch((err) => {
      console.error('[Mailer] Error sending reset email:', err);
    });

    console.log(`\n🔑 [Password Reset Link Generated] For: ${user.email}\n🔗 URL: ${resetUrl}\n`);

    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using reset token
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Hash the token from parameter to compare with database hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! Please sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  acceptInvite,
  forgotPassword,
  resetPassword,
};
