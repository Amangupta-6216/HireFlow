const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hireflow';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('HireFlow Full-Stack API Integration Tests', () => {
  let candidateToken = '';
  let recruiterToken = '';
  let interviewerToken = '';
  let sampleJobId = '';
  let testAppId = '';

  test('GET /api/health returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('POST /api/auth/login validates credentials & returns access token and cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'candidate@hireflow.dev',
        password: 'CandidatePassword123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe('candidate');

    candidateToken = res.body.accessToken;

    // Check refresh cookie in header
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('refreshToken='))).toBe(true);
  });

  test('POST /api/auth/login for recruiter sets company role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'owner@techcorp.com',
        password: 'OwnerPassword123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('company');
    expect(res.body.company.role).toBe('owner');
    recruiterToken = res.body.accessToken;
  });

  test('POST /api/auth/login for interviewer', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'interviewer@techcorp.com',
        password: 'InterviewerPassword123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.company.role).toBe('interviewer');
    interviewerToken = res.body.accessToken;
  });

  test('GET /api/jobs returns open jobs with text search/filters', async () => {
    const res = await request(app).get('/api/jobs?keyword=Senior');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.jobs)).toBe(true);
    expect(res.body.jobs.length).toBeGreaterThan(0);
    sampleJobId = res.body.jobs[0]._id;
  });

  test('Role check: Candidate receives 403 when trying to create a job', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        title: 'Hacker Position',
        description: 'Should fail',
        location: 'Remote',
        jobType: 'full-time',
        experienceLevel: 'senior',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Permission check: Interviewer receives 403 when trying to change application status', async () => {
    // Get application first
    const appsRes = await request(app)
      .get('/api/applications/job/all')
      .set('Authorization', `Bearer ${interviewerToken}`);

    expect(appsRes.status).toBe(200);
    if (appsRes.body.applications.length > 0) {
      testAppId = appsRes.body.applications[0]._id;

      const patchRes = await request(app)
        .patch(`/api/applications/${testAppId}/status`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send({ status: 'Offer' });

      // Should be 403 Forbidden!
      expect(patchRes.status).toBe(403);
    }
  });

  test('Duplicate application blocked: Candidate cannot apply twice to same job', async () => {
    // Marcus Chen already applied to job1 in the seed
    const res = await request(app)
      .post(`/api/jobs/${sampleJobId}/apply`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ coverLetter: 'Duplicate attempt' });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already applied/i);
  });
});
