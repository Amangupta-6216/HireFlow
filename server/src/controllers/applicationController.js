const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const { getPresignedResumeUrl } = require('../config/s3');
const { sendEmail } = require('../config/mailer');
const {
  applicationSubmittedCandidate,
  applicationReceivedRecruiter,
  applicationStatusChanged,
} = require('../utils/emailTemplates');

/**
 * @desc    Candidate applies to an open job
 * @route   POST /api/jobs/:id/apply
 * @access  Private (Candidate)
 */
const applyToJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const candidateId = req.user._id;

    // 1. Verify job exists and is open
    const job = await Job.findById(jobId).populate('company').populate('createdBy', 'name email');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications (status: ' + job.status + ')',
      });
    }

    // 2. Check for duplicate application
    const existingApp = await Application.findOne({ job: jobId, candidate: candidateId });
    if (existingApp) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this position',
      });
    }

    // 3. Check resume from profile or request body
    const profile = await CandidateProfile.findOne({ user: candidateId });
    const resumeKey = req.body.resumeKey || profile?.resumeKey;
    const resumeOriginalName = req.body.resumeOriginalName || profile?.resumeOriginalName || 'resume.pdf';

    if (!resumeKey) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume in your profile before applying',
      });
    }

    // 4. Create application
    const application = await Application.create({
      job: jobId,
      candidate: candidateId,
      company: job.company._id,
      resumeKey,
      resumeOriginalName,
      coverLetter: req.body.coverLetter || '',
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          changedBy: candidateId,
          changedAt: new Date(),
          note: 'Initial application submitted by candidate',
        },
      ],
    });

    // Increment applicantsCount on Job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

    // 5. Send automated confirmation emails asynchronously
    // To Candidate:
    const candidateEmail = applicationSubmittedCandidate(
      req.user.name,
      job.title,
      job.company.name
    );
    sendEmail({ to: req.user.email, ...candidateEmail }).catch(() => {});

    // To Recruiter:
    if (job.createdBy && job.createdBy.email) {
      const recruiterEmail = applicationReceivedRecruiter(
        job.createdBy.name,
        req.user.name,
        job.title
      );
      sendEmail({ to: job.createdBy.email, ...recruiterEmail }).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications for the logged-in candidate
 * @route   GET /api/applications/my-applications
 * @access  Private (Candidate)
 */
const getCandidateApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate({
        path: 'job',
        select: 'title location jobType experienceLevel salaryMin salaryMax currency status',
        populate: { path: 'company', select: 'name logo location verifiedStatus' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get applicants for a job (or all company applicants)
 * @route   GET /api/applications/job/:jobId
 * @access  Private (Company roles: Owner, HR, Interviewer)
 */
const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query;

    const query = { company: req.company._id };
    if (jobId && jobId !== 'all') {
      query.job = jobId;
    }

    // Role filtering: Interviewer can ONLY see applications assigned to them!
    if (req.companyRole === 'interviewer') {
      query.interviewers = req.user._id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('job', 'title location jobType experienceLevel status')
      .populate('candidate', 'name email avatar')
      .populate('interviewers', 'name email')
      .populate('statusHistory.changedBy', 'name')
      .sort({ createdAt: -1 });

    // Fetch candidate profiles to enrich applicant details
    const candidateIds = applications.map((app) => app.candidate._id);
    const profiles = await CandidateProfile.find({ user: { $in: candidateIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const enriched = applications.map((app) => {
      const appObj = app.toObject();
      appObj.candidateProfile = profileMap[app.candidate._id.toString()] || null;
      return appObj;
    });

    return res.status(200).json({
      success: true,
      applications: enriched,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application pipeline status
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Owner, HR only - Interviewer cannot update status!)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    // Interviewer cannot update status
    if (req.companyRole === 'interviewer') {
      return res.status(403).json({
        success: false,
        message: 'Interviewers are not permitted to update application statuses. Only HR or Owners can move candidates.',
      });
    }

    const application = await Application.findOne({ _id: id, company: req.company._id })
      .populate('candidate', 'name email')
      .populate('job', 'title')
      .populate('company', 'name');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Validate state transition
    const isValid = Application.isValidTransition(application.status, status);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${application.status}' to '${status}'. Allowed pipeline progression: Applied -> Shortlisted -> Interview -> Offer or Rejected.`,
      });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: note || `Status updated to ${status} by ${req.user.name} (${req.companyRole.toUpperCase()})`,
    });

    await application.save();

    // Send email notification to candidate
    if (application.candidate && application.candidate.email) {
      const emailContent = applicationStatusChanged(
        application.candidate.name,
        application.job.title,
        application.company.name,
        status,
        note
      );
      sendEmail({ to: application.candidate.email, ...emailContent }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: `Candidate moved to ${status}`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign interviewers to an application
 * @route   PATCH /api/applications/:id/assign-interviewers
 * @access  Private (Owner, HR)
 */
const assignInterviewers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { interviewerIds, setInterviewStatus = true } = req.body;

    if (!Array.isArray(interviewerIds)) {
      return res.status(400).json({ success: false, message: 'interviewerIds must be an array' });
    }

    const application = await Application.findOne({ _id: id, company: req.company._id })
      .populate('candidate', 'name email')
      .populate('job', 'title')
      .populate('company', 'name');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.interviewers = interviewerIds;

    // Automatically transition to 'Interview' stage if current stage is 'Applied' or 'Shortlisted'
    if (setInterviewStatus && (application.status === 'Applied' || application.status === 'Shortlisted')) {
      application.status = 'Interview';
      application.statusHistory.push({
        status: 'Interview',
        changedBy: req.user._id,
        changedAt: new Date(),
        note: `Interview stage initiated with ${interviewerIds.length} interviewer(s) assigned`,
      });

      // Send email to candidate
      const emailContent = applicationStatusChanged(
        application.candidate.name,
        application.job.title,
        application.company.name,
        'Interview',
        'Interviewers have been scheduled to evaluate your application.'
      );
      sendEmail({ to: application.candidate.email, ...emailContent }).catch(() => {});
    }

    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Interviewers assigned successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate short-lived signed URL for applicant's resume
 * @route   GET /api/applications/:id/resume-url
 * @access  Private (Recruiters of owning company or Candidate owner)
 */
const getApplicationResumeSignedUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check authorization: Candidate herself OR member of company
    let authorized = false;
    if (req.user.role === 'candidate' && application.candidate.toString() === req.user._id.toString()) {
      authorized = true;
    } else if (req.company && application.company.toString() === req.company._id.toString()) {
      // If interviewer, check if assigned
      if (req.companyRole === 'interviewer') {
        authorized = application.interviewers.some(
          (invId) => invId.toString() === req.user._id.toString()
        );
      } else {
        authorized = true;
      }
    } else if (req.user.role === 'admin') {
      authorized = true;
    }

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this applicant resume',
      });
    }

    const signedUrl = await getPresignedResumeUrl(application.resumeKey, 900); // 15 min validity

    return res.status(200).json({
      success: true,
      signedUrl,
      fileName: application.resumeOriginalName || 'resume.pdf',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getCandidateApplications,
  getJobApplicants,
  updateApplicationStatus,
  assignInterviewers,
  getApplicationResumeSignedUrl,
};
