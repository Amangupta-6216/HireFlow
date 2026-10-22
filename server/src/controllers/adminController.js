const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

/**
 * @desc    Get aggregate platform metrics & statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalCompanyUsers,
      totalCompanies,
      pendingCompanies,
      approvedCompanies,
      blockedCompanies,
      totalJobs,
      openJobs,
      draftJobs,
      closedJobs,
      totalApplications,
      applicationsByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'company' }),
      Company.countDocuments(),
      Company.countDocuments({ verifiedStatus: 'pending' }),
      Company.countDocuments({ verifiedStatus: 'approved' }),
      Company.countDocuments({ verifiedStatus: 'blocked' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      Job.countDocuments({ status: 'draft' }),
      Job.countDocuments({ status: 'closed' }),
      Application.countDocuments(),
      Application.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format application status breakdown
    const statusMap = {
      Applied: 0,
      Shortlisted: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    applicationsByStatus.forEach((item) => {
      if (item._id) statusMap[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          candidates: totalCandidates,
          companyUsers: totalCompanyUsers,
        },
        companies: {
          total: totalCompanies,
          pending: pendingCompanies,
          approved: approvedCompanies,
          blocked: blockedCompanies,
        },
        jobs: {
          total: totalJobs,
          open: openJobs,
          draft: draftJobs,
          closed: closedJobs,
        },
        applications: {
          total: totalApplications,
          byStatus: statusMap,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all companies with optional status filter
 * @route   GET /api/admin/companies
 * @access  Private (Admin)
 */
const getAllCompanies = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.verifiedStatus = status;
    }

    const companies = await Company.find(query)
      .populate('createdBy', 'name email createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update company verification status (approve or block)
 * @route   PATCH /api/admin/companies/:id/status
 * @access  Private (Admin)
 */
const updateCompanyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved', 'blocked', or 'pending'",
      });
    }

    const company = await Company.findById(id).populate('createdBy', 'name email');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    company.verifiedStatus = status;
    await company.save();

    return res.status(200).json({
      success: true,
      message: `Company status updated to ${status.toUpperCase()}`,
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all platform jobs for moderation
 * @route   GET /api/admin/jobs
 * @access  Private (Admin)
 */
const getAllJobs = async (req, res, next) => {
  try {
    const { status, keyword } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    const jobs = await Job.find(query)
      .populate('company', 'name logo verifiedStatus')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/moderate a job post (removes spam/inappropriate jobs)
 * @route   DELETE /api/admin/jobs/:id
 * @access  Private (Admin)
 */
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await Job.findByIdAndDelete(id);
    await Application.deleteMany({ job: id });

    return res.status(200).json({
      success: true,
      message: 'Job and associated applications removed by administrator',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all platform users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
  getAllCompanies,
  updateCompanyStatus,
  getAllJobs,
  deleteJob,
  getAllUsers,
};
