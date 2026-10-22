require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Membership = require('../models/Membership');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const Application = require('../models/Application');
const Feedback = require('../models/Feedback');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hireflow';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB database at:', mongoUri);

    // Clean existing collections
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Membership.deleteMany({}),
      Job.deleteMany({}),
      CandidateProfile.deleteMany({}),
      Application.deleteMany({}),
      Feedback.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing records.');

    // 1. Create Users
    console.log('[Seed] Creating demo accounts for all roles...');

    // Admin
    const adminUser = await User.create({
      name: 'Platform Administrator',
      email: 'admin@hireflow.dev',
      password: 'AdminPassword123!',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    // Company Owner
    const ownerUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'owner@techcorp.com',
      password: 'OwnerPassword123!',
      role: 'company',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    });

    // Company HR
    const hrUser = await User.create({
      name: 'David Miller',
      email: 'hr@techcorp.com',
      password: 'HrPassword123!',
      role: 'company',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    // Company Interviewer
    const interviewerUser = await User.create({
      name: 'Elena Rostova',
      email: 'interviewer@techcorp.com',
      password: 'InterviewerPassword123!',
      role: 'company',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    });

    // Pending Company Recruiter
    const pendingOwner = await User.create({
      name: 'Alex Vance',
      email: 'recruiter@startup.io',
      password: 'StartupPassword123!',
      role: 'company',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    });

    // Candidate 1 (Main test candidate)
    const candidateUser = await User.create({
      name: 'Marcus Chen',
      email: 'candidate@hireflow.dev',
      password: 'CandidatePassword123!',
      role: 'candidate',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    });

    // Candidate 2
    const candidate2 = await User.create({
      name: 'Aisha Patel',
      email: 'aisha.patel@example.com',
      password: 'CandidatePassword123!',
      role: 'candidate',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    // Candidate 3
    const candidate3 = await User.create({
      name: 'Lucas Silva',
      email: 'lucas.silva@example.com',
      password: 'CandidatePassword123!',
      role: 'candidate',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    });

    // 2. Create Companies
    console.log('[Seed] Creating Companies and Memberships...');

    const techCorp = await Company.create({
      name: 'TechCorp Cloud Solutions',
      slug: 'techcorp-cloud-solutions',
      description: 'Industry-leading cloud architecture, microservices, and distributed high-scale enterprise applications.',
      website: 'https://techcorp.example.com',
      location: 'San Francisco, CA (Hybrid / Remote)',
      logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=200',
      verifiedStatus: 'approved',
      industry: 'Cloud Computing & SaaS',
      companySize: '250-500 employees',
      foundedYear: 2018,
      createdBy: ownerUser._id,
    });

    const startupIo = await Company.create({
      name: 'NextGen AI Dynamics',
      slug: 'nextgen-ai-dynamics',
      description: 'Autonomous AI agents revolutionizing workflow productivity and multimodal workflows.',
      website: 'https://nextgenai.example.com',
      location: 'New York, NY',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200',
      verifiedStatus: 'pending', // Pending Admin approval!
      industry: 'Artificial Intelligence',
      companySize: '11-50 employees',
      foundedYear: 2024,
      createdBy: pendingOwner._id,
    });

    // 3. Create Memberships
    await Membership.create([
      {
        user: ownerUser._id,
        company: techCorp._id,
        companyRole: 'owner',
        status: 'active',
      },
      {
        user: hrUser._id,
        company: techCorp._id,
        companyRole: 'hr',
        status: 'active',
      },
      {
        user: interviewerUser._id,
        company: techCorp._id,
        companyRole: 'interviewer',
        status: 'active',
      },
      {
        user: pendingOwner._id,
        company: startupIo._id,
        companyRole: 'owner',
        status: 'active',
      },
    ]);

    // 4. Create Candidate Profiles
    console.log('[Seed] Creating Candidate Profiles with skills and resume...');

    await CandidateProfile.create({
      user: candidateUser._id,
      headline: 'Full-Stack MERN & Cloud Systems Engineer',
      bio: '5+ years building distributed React, Node.js, and high-performance microservices. Passionate about clean architectures and developer experience.',
      phone: '+1 (555) 234-5678',
      location: 'Austin, TX (Remote Available)',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Docker', 'AWS S3', 'Tailwind CSS', 'Redux Toolkit'],
      experience: [
        {
          title: 'Senior Frontend Engineer',
          company: 'Acme Digital',
          location: 'Austin, TX',
          startDate: new Date('2022-01-15'),
          current: true,
          description: 'Led development of customer-facing portals using React 18, Vite, and Redux Toolkit with sub-second page loads.',
        },
        {
          title: 'Full Stack Developer',
          company: 'HyperFlow Media',
          location: 'Remote',
          startDate: new Date('2019-06-01'),
          endDate: new Date('2021-12-31'),
          current: false,
          description: 'Engineered REST APIs using Express and MongoDB. Reduced query latency by 45% using compound indexes.',
        },
      ],
      education: [
        {
          school: 'University of Texas at Austin',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startDate: new Date('2015-08-20'),
          endDate: new Date('2019-05-15'),
          grade: '3.8 GPA',
        },
      ],
      resumeKey: 'resumes/demo_marcus_chen_resume.pdf',
      resumeOriginalName: 'Marcus_Chen_FullStack_Resume.pdf',
      portfolioUrl: 'https://marcuschen.dev',
      githubUrl: 'https://github.com/marcuschen',
      linkedinUrl: 'https://linkedin.com/in/marcuschen',
    });

    await CandidateProfile.create({
      user: candidate2._id,
      headline: 'Senior Backend Engineer | Distributed Systems & Node.js',
      bio: 'Specialist in scalable cloud architectures, Redis caching, message brokers, and database optimizations.',
      phone: '+1 (555) 876-5432',
      location: 'San Jose, CA',
      skills: ['Node.js', 'MongoDB', 'PostgreSQL', 'Kubernetes', 'AWS', 'Microservices', 'Express', 'Jest'],
      resumeKey: 'resumes/demo_aisha_patel_resume.pdf',
      resumeOriginalName: 'Aisha_Patel_Backend_Resume.pdf',
      portfolioUrl: 'https://aishapatel.io',
      githubUrl: 'https://github.com/aishapatel',
      linkedinUrl: 'https://linkedin.com/in/aishapatel',
    });

    await CandidateProfile.create({
      user: candidate3._id,
      headline: 'Product Designer & Frontend UI Developer',
      bio: 'Bridging design and code with Figma design systems, modern React UI, animations, and WCAG accessibility.',
      phone: '+1 (555) 345-9876',
      location: 'Seattle, WA',
      skills: ['React', 'Tailwind CSS', 'Figma', 'UI/UX Design', 'Design Systems', 'CSS Grid', 'Animation'],
      resumeKey: 'resumes/demo_lucas_silva_resume.pdf',
      resumeOriginalName: 'Lucas_Silva_Design_Resume.pdf',
      portfolioUrl: 'https://lucassilva.design',
    });

    // 5. Create Realistic Job Postings
    console.log('[Seed] Creating Job postings...');

    const job1 = await Job.create({
      company: techCorp._id,
      title: 'Senior Full-Stack MERN Developer',
      description: `TechCorp is seeking a Senior Full-Stack MERN Developer to lead core product initiatives for our real-time cloud collaboration platform.

You will architect modular React frontends, design resilient Express/Node microservices, implement secure JWT & role authorization architectures, and optimize MongoDB aggregations.

Key Responsibilities:
• Build responsive, high-performance web applications using React, Redux Toolkit, and Tailwind CSS
• Implement RESTful API endpoints with Express, express-validator, and MongoDB Atlas
• Integrate cloud file handling (AWS S3) and email pipelines (Nodemailer)
• Collaborate with design, product managers, and engineering teams to ship weekly releases`,
      requirements: [
        '5+ years of fullstack web development experience with React and Node.js',
        'Strong mastery of MongoDB schema modeling, compound indexing, and aggregation pipelines',
        'Demonstrated knowledge of modern authentication (JWT access/refresh token pairs, cookie security)',
        'Experience with unit & integration testing using Jest and Supertest',
      ],
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Redux Toolkit', 'Tailwind CSS', 'JWT', 'REST API'],
      jobType: 'full-time',
      experienceLevel: 'senior',
      location: 'San Francisco, CA',
      isRemote: true,
      salaryMin: 140000,
      salaryMax: 185000,
      currency: 'USD',
      status: 'open',
      applicantsCount: 3,
      createdBy: hrUser._id,
    });

    const job2 = await Job.create({
      company: techCorp._id,
      title: 'Lead Frontend UI/UX Architect (React & Tailwind)',
      description: `Join our team to transform the user experience across all enterprise dashboards and real-time trackers.

We care deeply about visual excellence, design tokens, micro-animations, glassmorphism, and responsive ergonomics.`,
      requirements: [
        '4+ years building complex web UIs with React, Vite, and Tailwind CSS',
        'Deep understanding of state management (Redux Toolkit or Zustand)',
        'Pixel-perfect attention to detail and modern typography/motion design',
      ],
      skills: ['React', 'Tailwind CSS', 'TypeScript', 'UI/UX', 'Design Systems', 'Vite'],
      jobType: 'full-time',
      experienceLevel: 'lead',
      location: 'Remote, US',
      isRemote: true,
      salaryMin: 155000,
      salaryMax: 195000,
      currency: 'USD',
      status: 'open',
      applicantsCount: 1,
      createdBy: ownerUser._id,
    });

    const job3 = await Job.create({
      company: techCorp._id,
      title: 'Backend Systems & Cloud Engineer (Node.js / AWS)',
      description: `Drive backend reliability, rate-limiting, security headers with Helmet, and AWS S3 storage architectures for millions of active payloads.`,
      requirements: [
        '3+ years Node.js and Express backend experience',
        'Experience with AWS SDK (S3 presigned URLs, CloudFront)',
        'Understanding of caching, rate limiting, and security compliance',
      ],
      skills: ['Node.js', 'Express', 'AWS S3', 'MongoDB', 'Docker', 'REST API'],
      jobType: 'contract',
      experienceLevel: 'mid',
      location: 'San Francisco, CA',
      isRemote: false,
      salaryMin: 110000,
      salaryMax: 140000,
      currency: 'USD',
      status: 'open',
      applicantsCount: 0,
      createdBy: hrUser._id,
    });

    const job4 = await Job.create({
      company: techCorp._id,
      title: 'Junior Frontend Developer (React / JavaScript)',
      description: `Great opportunity for an ambitious junior engineer to level up their skills on real enterprise React codebases with mentorship from senior engineers.`,
      requirements: [
        'Solid foundation in JavaScript, HTML5, CSS3, and React fundamentals',
        'Familiarity with Git, component state, and REST API integration with Axios',
        'Eagerness to learn and take constructive feedback',
      ],
      skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'Axios'],
      jobType: 'full-time',
      experienceLevel: 'entry',
      location: 'San Francisco, CA',
      isRemote: false,
      salaryMin: 85000,
      salaryMax: 105000,
      currency: 'USD',
      status: 'draft', // Draft status
      applicantsCount: 0,
      createdBy: hrUser._id,
    });

    // 6. Create Applications across the pipeline
    console.log('[Seed] Creating demo applications across the pipeline (Applied -> Shortlisted -> Interview -> Offer/Rejected)...');

    // App 1: Marcus Chen -> Senior Full-Stack -> Currently in 'Interview' stage
    const app1 = await Application.create({
      job: job1._id,
      candidate: candidateUser._id,
      company: techCorp._id,
      resumeKey: 'resumes/demo_marcus_chen_resume.pdf',
      resumeOriginalName: 'Marcus_Chen_FullStack_Resume.pdf',
      coverLetter: 'I am excited to apply for the Senior Full-Stack MERN role at TechCorp. With 5 years of production React and Node.js expertise, I have built real-time workflows and scale-tested MongoDB clusters that align directly with your technical stack.',
      status: 'Interview',
      interviewers: [interviewerUser._id],
      statusHistory: [
        {
          status: 'Applied',
          changedBy: candidateUser._id,
          changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          note: 'Initial application submitted',
        },
        {
          status: 'Shortlisted',
          changedBy: hrUser._id,
          changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          note: 'Impressive MERN stack portfolio and architecture skills. Candidate shortlisted.',
        },
        {
          status: 'Interview',
          changedBy: hrUser._id,
          changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          note: 'Technical interview scheduled with Elena Rostova (Interviewer).',
        },
      ],
    });

    // App 2: Aisha Patel -> Senior Full-Stack -> In 'Shortlisted' stage
    await Application.create({
      job: job1._id,
      candidate: candidate2._id,
      company: techCorp._id,
      resumeKey: 'resumes/demo_aisha_patel_resume.pdf',
      resumeOriginalName: 'Aisha_Patel_Backend_Resume.pdf',
      coverLetter: 'Strong background in Node.js microservices and database indexing.',
      status: 'Shortlisted',
      interviewers: [],
      statusHistory: [
        {
          status: 'Applied',
          changedBy: candidate2._id,
          changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          note: 'Application received',
        },
        {
          status: 'Shortlisted',
          changedBy: hrUser._id,
          changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          note: 'Selected for initial HR screen.',
        },
      ],
    });

    // App 3: Lucas Silva -> Senior Full-Stack -> 'Applied' stage
    await Application.create({
      job: job1._id,
      candidate: candidate3._id,
      company: techCorp._id,
      resumeKey: 'resumes/demo_lucas_silva_resume.pdf',
      resumeOriginalName: 'Lucas_Silva_Design_Resume.pdf',
      coverLetter: 'Full-stack candidate with specialized eye for UI/UX.',
      status: 'Applied',
      interviewers: [],
      statusHistory: [
        {
          status: 'Applied',
          changedBy: candidate3._id,
          changedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          note: 'Candidate submitted application',
        },
      ],
    });

    // App 4: Lucas Silva -> Lead Frontend UI/UX -> 'Offer' stage!
    await Application.create({
      job: job2._id,
      candidate: candidate3._id,
      company: techCorp._id,
      resumeKey: 'resumes/demo_lucas_silva_resume.pdf',
      resumeOriginalName: 'Lucas_Silva_Design_Resume.pdf',
      coverLetter: 'Passionate about crafting state-of-the-art UI architectures.',
      status: 'Offer',
      interviewers: [interviewerUser._id],
      statusHistory: [
        {
          status: 'Applied',
          changedBy: candidate3._id,
          changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          note: 'Applied',
        },
        {
          status: 'Shortlisted',
          changedBy: hrUser._id,
          changedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          note: 'Shortlisted for portfolio review',
        },
        {
          status: 'Interview',
          changedBy: hrUser._id,
          changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          note: 'Interviewed with team',
        },
        {
          status: 'Offer',
          changedBy: ownerUser._id,
          changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          note: 'Formal offer extended after stellar technical evaluation',
        },
      ],
    });

    // 7. Create Feedback by Interviewer
    console.log('[Seed] Creating interviewer evaluation feedback...');

    await Feedback.create({
      application: app1._id,
      interviewer: interviewerUser._id,
      rating: 5,
      comments: 'Marcus demonstrated comprehensive understanding of MERN architecture, React 18 concurrency, and MongoDB indexing strategies. Handled complex live coding questions with ease and clear communication.',
      recommendation: 'strong_yes',
      submittedAt: new Date(),
    });

    console.log('\n===============================================================');
    console.log('✅ HIREFLOW DATABASE SEEDED SUCCESSFULLY!');
    console.log('===============================================================');
    console.log('Demo Credentials for Instant Testing:');
    console.log('---------------------------------------------------------------');
    console.log('1. Admin:');
    console.log('   Email:    admin@hireflow.dev');
    console.log('   Password: AdminPassword123!');
    console.log('   Role:     admin (Platform Stats, Approve/Block Companies, Moderate Jobs)');
    console.log('');
    console.log('2. Recruiter Owner (Approved Company - TechCorp):');
    console.log('   Email:    owner@techcorp.com');
    console.log('   Password: OwnerPassword123!');
    console.log('   Role:     company -> owner (Company Profile, Team Invites, Job CRUD, Pipeline)');
    console.log('');
    console.log('3. Recruiter HR (TechCorp):');
    console.log('   Email:    hr@techcorp.com');
    console.log('   Password: HrPassword123!');
    console.log('   Role:     company -> hr (Job CRUD, Pipeline, Assign Interviewers, Review Feedback)');
    console.log('');
    console.log('4. Interviewer (TechCorp):');
    console.log('   Email:    interviewer@techcorp.com');
    console.log('   Password: InterviewerPassword123!');
    console.log('   Role:     company -> interviewer (View Assigned Applicants, Submit & View Own Feedback)');
    console.log('');
    console.log('5. Candidate:');
    console.log('   Email:    candidate@hireflow.dev');
    console.log('   Password: CandidatePassword123!');
    console.log('   Role:     candidate (Search, Filters, 1-Click Apply, Resume, Status Badges)');
    console.log('');
    console.log('6. Recruiter (Pending Company):');
    console.log('   Email:    recruiter@startup.io');
    console.log('   Password: StartupPassword123!');
    console.log('   Role:     company -> owner (Pending admin approval test)');
    console.log('===============================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
