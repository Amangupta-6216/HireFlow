const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadResume,
  toggleSaveJob,
  getSavedJobs,
  viewLocalResume,
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { requirePlatformRole } = require('../middleware/role');
const { resumeUpload } = require('../middleware/upload');

const router = express.Router();

// Fallback route for viewing/downloading local resumes (secured via signature query params)
router.get('/resumes/view/:key', viewLocalResume);

// Protected routes below
router.use(protect);
router.use(requirePlatformRole('candidate'));

// Candidate profile CRUD
router.get('/', getProfile);
router.put('/', updateProfile);

// Resume upload via Multer (enforces PDF/DOCX and <= 2 MB)
router.post('/resume', resumeUpload.single('resume'), uploadResume);

// Save / Bookmark jobs
router.post('/save-job/:jobId', toggleSaveJob);
router.get('/saved-jobs', getSavedJobs);

module.exports = router;
