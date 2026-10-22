const Membership = require('../models/Membership');
const Company = require('../models/Company');

/**
 * Restricts access based on Platform Role (user.role)
 * @param  {...string} roles - 'candidate', 'company', 'admin'
 */
const requirePlatformRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Platform role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

/**
 * Finds user membership in company and validates Company Role (membership.companyRole)
 * @param  {...string} allowedRoles - 'owner', 'hr', 'interviewer'
 */
const requireCompanyRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      // Admin has override capability if needed
      if (req.user.role === 'admin') {
        return next();
      }

      if (req.user.role !== 'company') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Must be a company user',
        });
      }

      // Determine company ID from params, body, or active membership
      const companyId = req.params.companyId || req.body.company || req.query.companyId;

      let membership;
      if (companyId) {
        membership = await Membership.findOne({
          user: req.user._id,
          company: companyId,
          status: 'active',
        }).populate('company');
      } else {
        // Look up primary company membership
        membership = await Membership.findOne({
          user: req.user._id,
          status: 'active',
        }).populate('company');
      }

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'No active company membership found for your account',
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.companyRole)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Company role '${membership.companyRole}' cannot perform this action. Required: ${allowedRoles.join(', ')}`,
        });
      }

      // Attach membership & company to request
      req.membership = membership;
      req.company = membership.company;
      req.companyRole = membership.companyRole;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Ensures company is approved by admin before posting/publishing jobs
 */
const requireApprovedCompany = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();

    const company = req.company || (req.membership && req.membership.company);
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company context required',
      });
    }

    if (company.verifiedStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your company status is '${company.verifiedStatus}'. An administrator must approve your company before you can publish jobs.`,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requirePlatformRole,
  requireCompanyRole,
  requireApprovedCompany,
};
