const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  companyName: { type: String, default: '' },
  duration: { type: String, default: '' },
  projects: { type: String, default: '' },
  skillsLearned: { type: [String], default: [] },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  duration: { type: String, default: '' },
  description: { type: String, default: '' },
  skillsUsed: { type: [String], default: [] },
  link: { type: String, default: '' },
});

const achievementSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  date: { type: String, default: '' },
});

const languageSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  proficiency: { type: String, default: 'Fluent' },
});

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    // 1. Preference
    preference: {
      preferredJobType: {
        type: [String],
        default: ['Jobs', 'Internships'],
      },
      availability: {
        type: String,
        default: 'More than 3 Months',
      },
      preferredLocations: {
        type: [String],
        default: ['Hyderabad/Secunderabad', 'Bangalore/Bengaluru', 'Pune', 'Noida', 'Delhi / NCR'],
      },
    },
    // 2. Resume
    resumeKey: {
      type: String,
      default: '',
    },
    resumeOriginalName: {
      type: String,
      default: '',
    },
    resumeUploadedAt: {
      type: Date,
    },
    // 3. Education (Graduation, Class XII, Class X)
    education: {
      graduation: {
        degree: { type: String, default: 'B.Tech / B.E.' },
        institution: { type: String, default: '' },
        startYear: { type: String, default: '' },
        endYear: { type: String, default: '' },
        courseType: { type: String, default: 'Full Time' },
        score: { type: String, default: '' },
      },
      classXII: {
        board: { type: String, default: 'CBSE' },
        medium: { type: String, default: 'English' },
        passingYear: { type: String, default: '' },
        score: { type: String, default: '' },
        school: { type: String, default: '' },
      },
      classX: {
        board: { type: String, default: 'CBSE' },
        medium: { type: String, default: 'English' },
        passingYear: { type: String, default: '' },
        score: { type: String, default: '' },
        school: { type: String, default: '' },
      },
    },
    // 4. Key skills
    keySkills: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    // 5. Languages
    languages: {
      type: [languageSchema],
      default: [
        { name: 'English', proficiency: 'Fluent' },
        { name: 'Hindi', proficiency: 'Proficient' },
      ],
    },
    // 6. Internships
    internships: [internshipSchema],
    // 7. Projects
    projects: [projectSchema],
    // 8. Achievements
    achievements: [achievementSchema],

    portfolioUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
