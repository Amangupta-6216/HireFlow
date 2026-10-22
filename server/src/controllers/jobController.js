const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');

/**
 * @desc    Search and filter public open jobs
 * @route   GET /api/jobs
 * @access  Public
 */
const getJobs = async (req, res, next) => {
  try {
    const {
      keyword,
      location,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      isRemote,
      page = 1,
      limit = 10,
      sortBy = 'newest',
    } = req.query;

    const query = { status: 'open' };

    // Search query: Text search or regex
    if (keyword && keyword.trim()) {
      query.$text = { $search: keyword.trim() };
    }

    // Location filter
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Job type
    if (jobType && jobType !== 'all') {
      const types = jobType.split(',');
      query.jobType = { $in: types };
    }

    // Experience level
    if (experienceLevel && experienceLevel !== 'all') {
      const levels = experienceLevel.split(',');
      query.experienceLevel = { $in: levels };
    }

    // Remote only filter
    if (isRemote === 'true') {
      query.isRemote = true;
    }

    // Salary filters
    if (minSalary) {
      query.salaryMax = { $gte: Number(minSalary) };
    }
    if (maxSalary) {
      query.salaryMin = { $lte: Number(maxSalary) };
    }

    // Only approved companies are visible in public job search
    const approvedCompanies = await Company.find({ verifiedStatus: 'approved' }).select('_id');
    const approvedCompanyIds = approvedCompanies.map((c) => c._id);
    query.company = { $in: approvedCompanyIds };

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (keyword && keyword.trim()) {
      sortOptions = { score: { $meta: 'textScore' } };
    } else if (sortBy === 'salaryHigh') {
      sortOptions = { salaryMax: -1 };
    } else if (sortBy === 'salaryLow') {
      sortOptions = { salaryMin: 1 };
    }

    const projection = keyword && keyword.trim() ? { score: { $meta: 'textScore' } } : {};

    const [jobs, totalJobs] = await Promise.all([
      Job.find(query, projection)
        .populate('company', 'name slug logo location website verifiedStatus')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      jobs,
      pagination: {
        total: totalJobs,
        page: pageNum,
        pages: Math.ceil(totalJobs / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public (Optional auth for applied/saved status)
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('company');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    let hasApplied = false;
    let isSaved = false;

    if (req.user && req.user.role === 'candidate') {
      const [app, profile] = await Promise.all([
        Application.findOne({ job: job._id, candidate: req.user._id }),
        CandidateProfile.findOne({ user: req.user._id }),
      ]);
      hasApplied = Boolean(app);
      isSaved = Boolean(profile?.savedJobs?.includes(job._id));
    }

    return res.status(200).json({
      success: true,
      job,
      hasApplied,
      isSaved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs for recruiter's company (draft, open, closed)
 * @route   GET /api/jobs/company/all
 * @access  Private (Owner, HR, Interviewer)
 */
const getCompanyJobs = async (req, res, next) => {
  try {
    const companyId = req.company._id;
    const { status } = req.query;

    const query = { company: companyId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const jobs = await Job.find(query)
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
 * @desc    Create new job (draft or open)
 * @route   POST /api/jobs
 * @access  Private (Owner, HR)
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requirements,
      skills,
      jobType,
      experienceLevel,
      location,
      isRemote,
      salaryMin,
      salaryMax,
      currency,
      status = 'draft',
    } = req.body;

    const company = req.company;

    // If attempting to publish directly as 'open', require company to be approved
    if (status === 'open' && company.verifiedStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your company must be approved by an administrator before publishing open jobs. You may save this as a draft.',
      });
    }

    const job = await Job.create({
      company: company._id,
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
      jobType,
      experienceLevel,
      location: location || company.location || 'Remote',
      isRemote: Boolean(isRemote),
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      currency: currency || 'USD',
      status: status || 'draft',
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: status === 'open' ? 'Job published successfully' : 'Job saved as draft',
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing job
 * @route   PUT /api/jobs/:id
 * @access  Private (Owner, HR)
 */
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, company: req.company._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found in your company' });
    }

    const {
      title,
      description,
      requirements,
      skills,
      jobType,
      experienceLevel,
      location,
      isRemote,
      salaryMin,
      salaryMax,
      currency,
      status,
    } = req.body;

    // Check approval if changing status to open
    if (status === 'open' && req.company.verifiedStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Cannot publish job: Your company is not yet approved by an admin.',
      });
    }

    if (title) job.title = title;
    if (description) job.description = description;
    if (requirements !== undefined) {
      job.requirements = Array.isArray(requirements) ? requirements : [requirements];
    }
    if (skills !== undefined) {
      job.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    }
    if (jobType) job.jobType = jobType;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (location) job.location = location;
    if (isRemote !== undefined) job.isRemote = Boolean(isRemote);
    if (salaryMin !== undefined) job.salaryMin = Number(salaryMin);
    if (salaryMax !== undefined) job.salaryMax = Number(salaryMax);
    if (currency) job.currency = currency;
    if (status) job.status = status;

    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close a job (no longer appears in public search)
 * @route   PATCH /api/jobs/:id/close
 * @access  Private (Owner, HR)
 */
const closeJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, company: req.company._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found in your company' });
    }

    job.status = 'closed';
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job closed. It has been removed from public listings.',
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job
 * @route   DELETE /api/jobs/:id
 * @access  Private (Owner, Admin)
 */
const deleteJob = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, company: req.company._id };

    const job = await Job.findOne(query);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await Job.findByIdAndDelete(job._id);
    await Application.deleteMany({ job: job._id });

    return res.status(200).json({
      success: true,
      message: 'Job and associated applications deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  getCompanyJobs,
  createJob,
  updateJob,
  closeJob,
  deleteJob,
};
