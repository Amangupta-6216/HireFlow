const crypto = require('crypto');
const Company = require('../models/Company');
const Membership = require('../models/Membership');
const Invite = require('../models/Invite');
const User = require('../models/User');
const { sendEmail } = require('../config/mailer');
const { companyInvitation } = require('../utils/emailTemplates');

/**
 * @desc    Get current user's company profile & membership
 * @route   GET /api/company/my-company
 * @access  Private (Company role)
 */
const getMyCompany = async (req, res, next) => {
  try {
    const membership = await Membership.findOne({ user: req.user._id, status: 'active' })
      .populate('company')
      .populate('user', 'name email avatar');

    if (!membership || !membership.company) {
      return res.status(404).json({
        success: false,
        message: 'No company associated with this account',
      });
    }

    return res.status(200).json({
      success: true,
      company: membership.company,
      role: membership.companyRole,
      membership,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update company profile (Owner only)
 * @route   PUT /api/company/profile
 * @access  Private (Company Owner)
 */
const updateCompanyProfile = async (req, res, next) => {
  try {
    const { name, description, website, location, industry, companySize, foundedYear, logo } = req.body;
    const company = req.company;

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (name) company.name = name;
    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (location !== undefined) company.location = location;
    if (industry !== undefined) company.industry = industry;
    if (companySize !== undefined) company.companySize = companySize;
    if (foundedYear !== undefined) company.foundedYear = foundedYear;
    if (logo !== undefined) company.logo = logo;

    await company.save();

    return res.status(200).json({
      success: true,
      message: 'Company profile updated successfully',
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get team members of the company (Owner and HR)
 * @route   GET /api/company/members
 * @access  Private (Owner, HR)
 */
const getTeamMembers = async (req, res, next) => {
  try {
    const members = await Membership.find({ company: req.company._id, status: 'active' })
      .populate('user', 'name email avatar createdAt')
      .sort({ createdAt: -1 });

    const pendingInvites = await Invite.find({
      company: req.company._id,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).populate('invitedBy', 'name');

    return res.status(200).json({
      success: true,
      members,
      pendingInvites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Invite team member (HR or Interviewer) (Owner only)
 * @route   POST /api/company/invite
 * @access  Private (Owner only)
 */
const inviteTeamMember = async (req, res, next) => {
  try {
    const { email, companyRole } = req.body;

    if (!['hr', 'interviewer'].includes(companyRole)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'hr' or 'interviewer'",
      });
    }

    // Check if user is already a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingMembership = await Membership.findOne({
        user: existingUser._id,
        company: req.company._id,
        status: 'active',
      });
      if (existingMembership) {
        return res.status(409).json({
          success: false,
          message: 'This user is already an active member of your company team',
        });
      }
    }

    // Generate unique invite token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Create or update invite
    await Invite.findOneAndUpdate(
      { company: req.company._id, email },
      {
        company: req.company._id,
        email,
        companyRole,
        tokenHash,
        invitedBy: req.user._id,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${clientUrl}/accept-invite?token=${rawToken}&email=${encodeURIComponent(email)}`;

    // Send invite email
    const emailData = companyInvitation(req.user.name, req.company.name, companyRole, inviteLink);
    await sendEmail({ to: email, ...emailData });

    return res.status(201).json({
      success: true,
      message: `Invitation sent to ${email} as ${companyRole.toUpperCase()}`,
      inviteLink: process.env.NODE_ENV !== 'production' ? inviteLink : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update team member role (Owner only)
 * @route   PATCH /api/company/members/:memberId/role
 * @access  Private (Owner only)
 */
const updateMemberRole = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const { companyRole } = req.body;

    if (!['hr', 'interviewer'].includes(companyRole)) {
      return res.status(400).json({
        success: false,
        message: "New role must be 'hr' or 'interviewer'",
      });
    }

    const membership = await Membership.findOne({
      _id: memberId,
      company: req.company._id,
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    if (membership.companyRole === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote the primary company owner',
      });
    }

    membership.companyRole = companyRole;
    await membership.save();

    return res.status(200).json({
      success: true,
      message: `Member role updated to ${companyRole.toUpperCase()}`,
      membership,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove team member (Owner only)
 * @route   DELETE /api/company/members/:memberId
 * @access  Private (Owner only)
 */
const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    const membership = await Membership.findOne({
      _id: memberId,
      company: req.company._id,
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    if (membership.companyRole === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the primary company owner',
      });
    }

    await Membership.findByIdAndDelete(memberId);

    return res.status(200).json({
      success: true,
      message: 'Team member removed from company',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCompany,
  updateCompanyProfile,
  getTeamMembers,
  inviteTeamMember,
  updateMemberRole,
  removeMember,
};
