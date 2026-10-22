const path = require('path');
const fs = require('fs');
const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const { uploadFile, getPresignedResumeUrl, verifyLocalSignature, LOCAL_STORAGE_DIR } = require('../config/s3');

/**
 * @desc    Get candidate profile
 * @route   GET /api/profile
 * @access  Private (Candidate)
 */
const getProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ user: req.user._id })
      .populate('user', 'name email avatar')
      .populate({
        path: 'savedJobs',
        populate: { path: 'company', select: 'name logo location verifiedStatus' },
      });

    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user._id });
      profile = await profile.populate('user', 'name email avatar');
    }

    let resumeSignedUrl = null;
    if (profile.resumeKey) {
      resumeSignedUrl = await getPresignedResumeUrl(profile.resumeKey, 900);
    }

    return res.status(200).json({
      success: true,
      profile,
      resumeSignedUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update candidate profile details
 * @route   PUT /api/profile
 * @access  Private (Candidate)
 */
/**
 * @desc    Update candidate profile details
 * @route   PUT /api/profile
 * @access  Private (Candidate)
 */
const updateProfile = async (req, res, next) => {
  try {
    const {
      bio,
      location,
      phone,
      preference,
      education,
      keySkills,
      skills,
      languages,
      internships,
      projects,
      achievements,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
    } = req.body;

    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user._id });
    }

    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (phone !== undefined) profile.phone = phone;

    // 1. Preference
    if (preference !== undefined) {
      profile.preference = {
        preferredJobType: Array.isArray(preference.preferredJobType)
          ? preference.preferredJobType
          : preference.preferredJobType
          ? [preference.preferredJobType]
          : profile.preference?.preferredJobType || ['Jobs', 'Internships'],
        availability: preference.availability !== undefined ? preference.availability : (profile.preference?.availability || 'More than 3 Months'),
        preferredLocations: Array.isArray(preference.preferredLocations)
          ? preference.preferredLocations
          : typeof preference.preferredLocations === 'string'
          ? preference.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean)
          : profile.preference?.preferredLocations || [],
      };
      profile.markModified('preference');
    }

    // 2. Education (Graduation, Class XII, Class X)
    if (education !== undefined) {
      profile.education = {
        graduation: {
          degree: education.graduation?.degree !== undefined ? education.graduation.degree : (profile.education?.graduation?.degree || 'B.Tech / B.E.'),
          institution: education.graduation?.institution !== undefined ? education.graduation.institution : (profile.education?.graduation?.institution || ''),
          startYear: education.graduation?.startYear !== undefined ? education.graduation.startYear : (profile.education?.graduation?.startYear || ''),
          endYear: education.graduation?.endYear !== undefined ? education.graduation.endYear : (profile.education?.graduation?.endYear || ''),
          courseType: education.graduation?.courseType !== undefined ? education.graduation.courseType : (profile.education?.graduation?.courseType || 'Full Time'),
          score: education.graduation?.score !== undefined ? education.graduation.score : (profile.education?.graduation?.score || ''),
        },
        classXII: {
          board: education.classXII?.board !== undefined ? education.classXII.board : (profile.education?.classXII?.board || 'CBSE'),
          medium: education.classXII?.medium !== undefined ? education.classXII.medium : (profile.education?.classXII?.medium || 'English'),
          passingYear: education.classXII?.passingYear !== undefined ? education.classXII.passingYear : (profile.education?.classXII?.passingYear || ''),
          score: education.classXII?.score !== undefined ? education.classXII.score : (profile.education?.classXII?.score || ''),
          school: education.classXII?.school !== undefined ? education.classXII.school : (profile.education?.classXII?.school || ''),
        },
        classX: {
          board: education.classX?.board !== undefined ? education.classX.board : (profile.education?.classX?.board || 'CBSE'),
          medium: education.classX?.medium !== undefined ? education.classX.medium : (profile.education?.classX?.medium || 'English'),
          passingYear: education.classX?.passingYear !== undefined ? education.classX.passingYear : (profile.education?.classX?.passingYear || ''),
          score: education.classX?.score !== undefined ? education.classX.score : (profile.education?.classX?.score || ''),
          school: education.classX?.school !== undefined ? education.classX.school : (profile.education?.classX?.school || ''),
        },
      };
      profile.markModified('education');
    }

    // 3. Key Skills
    const skillsToSave = keySkills !== undefined ? keySkills : skills;
    if (skillsToSave !== undefined) {
      const parsedSkills = Array.isArray(skillsToSave)
        ? skillsToSave
        : typeof skillsToSave === 'string'
        ? skillsToSave.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      profile.keySkills = parsedSkills;
      profile.skills = parsedSkills;
      profile.markModified('keySkills');
      profile.markModified('skills');
    }

    // 4. Languages
    if (languages !== undefined) {
      profile.languages = Array.isArray(languages) ? languages : [];
      profile.markModified('languages');
    }

    // 5. Internships
    if (internships !== undefined) {
      profile.internships = Array.isArray(internships)
        ? internships.map((item) => ({
            companyName: item.companyName || '',
            duration: item.duration || '',
            projects: item.projects || '',
            skillsLearned: Array.isArray(item.skillsLearned)
              ? item.skillsLearned
              : typeof item.skillsLearned === 'string'
              ? item.skillsLearned.split(',').map((s) => s.trim()).filter(Boolean)
              : [],
          }))
        : [];
      profile.markModified('internships');
    }

    // 6. Projects
    if (projects !== undefined) {
      profile.projects = Array.isArray(projects)
        ? projects.map((item) => ({
            title: item.title || '',
            duration: item.duration || '',
            description: item.description || '',
            skillsUsed: Array.isArray(item.skillsUsed)
              ? item.skillsUsed
              : typeof item.skillsUsed === 'string'
              ? item.skillsUsed.split(',').map((s) => s.trim()).filter(Boolean)
              : [],
            link: item.link || '',
          }))
        : [];
      profile.markModified('projects');
    }

    // 7. Achievements
    if (achievements !== undefined) {
      profile.achievements = Array.isArray(achievements)
        ? achievements.map((item) => ({
            title: item.title || '',
            description: item.description || '',
            date: item.date || '',
          }))
        : [];
      profile.markModified('achievements');
    }

    if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;
    if (githubUrl !== undefined) profile.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;

    await profile.save();
    profile = await CandidateProfile.findById(profile._id).populate('user', 'name email avatar');

    let resumeSignedUrl = null;
    if (profile.resumeKey) {
      resumeSignedUrl = await getPresignedResumeUrl(profile.resumeKey, 900);
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated and saved successfully!',
      profile,
      resumeSignedUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload candidate resume (PDF or DOCX, under 2 MB)
 * @route   POST /api/profile/resume
 * @access  Private (Candidate)
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a resume file to upload' });
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname).toLowerCase();
    const uniqueKey = `resumes/${req.user._id}_${Date.now()}${fileExt}`;

    // Upload to S3 or local fallback
    const result = await uploadFile(file.buffer, uniqueKey, file.mimetype);

    // Save key in CandidateProfile
    const profile = await CandidateProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        resumeKey: result.key,
        resumeOriginalName: file.originalname,
        resumeUploadedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Generate short-lived presigned URL
    const signedUrl = await getPresignedResumeUrl(result.key, 900);

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeKey: result.key,
      fileName: file.originalname,
      signedUrl,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle saving a job
 * @route   POST /api/profile/save-job/:jobId
 * @access  Private (Candidate)
 */
const toggleSaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user._id });
    }

    const jobIndex = profile.savedJobs.indexOf(jobId);
    let isSaved = false;

    if (jobIndex > -1) {
      profile.savedJobs.splice(jobIndex, 1);
      isSaved = false;
    } else {
      profile.savedJobs.push(jobId);
      isSaved = true;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: isSaved ? 'Job saved to your bookmarks' : 'Job removed from bookmarks',
      isSaved,
      savedJobs: profile.savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all saved jobs
 * @route   GET /api/profile/saved-jobs
 * @access  Private (Candidate)
 */
const getSavedJobs = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user._id }).populate({
      path: 'savedJobs',
      populate: { path: 'company', select: 'name logo location verifiedStatus' },
    });

    return res.status(200).json({
      success: true,
      savedJobs: profile?.savedJobs || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    View/Download locally stored resume with signed URL verification
 * @route   GET /api/profile/resumes/view/:key
 * @access  Public (Secured with HMAC signature and expiry)
 */
const viewLocalResume = async (req, res) => {
  const { key } = req.params;
  const { expires, sig } = req.query;

  const isValid = verifyLocalSignature(key, expires, sig);
  if (!isValid) {
    return res.status(403).send('Invalid or expired secure resume link');
  }

  const filePath = path.join(LOCAL_STORAGE_DIR, key);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Resume file not found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', 'inline; filename="resume' + ext + '"');
  return fs.createReadStream(filePath).pipe(res);
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  toggleSaveJob,
  getSavedJobs,
  viewLocalResume,
};
