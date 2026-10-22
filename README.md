# 🚀 HireFlow — Industry-Standard MERN Full-Stack Job Portal Platform

**HireFlow** is an enterprise-grade, multi-tenant career and recruitment platform built on the modern MERN stack (**MongoDB**, **Express**, **React 18**, **Node.js**), **Vite**, **Redux Toolkit**, **Tailwind CSS**, **AWS S3 / S3 Presigned URLs**, and **Nodemailer**.

It implements strict enterprise security, hierarchical dual-layer role-based access control (RBAC), presigned short-lived S3 resume access, silent JWT token rotation via httpOnly cookies, and real-time candidate pipeline tracking.

---

## 📌 Architecture & Request Lifecycle

```
React Form (React Hook Form)
   └──> Axios Client (Sends Bearer access token, credentials: true)
         └──> Express API:
               ├── Rate-Limit (express-rate-limit: strict on auth, loose on API)
               ├── Security Headers (helmet: clickjacking & MIME protection)
               ├── CORS (Credentials enabled, whitelisted origin)
               ├── JWT Authentication Middleware (Verifies 15-min Access Token)
               ├── Role-Based Access Control (Platform role + Company role)
               ├── Data Validation & Sanitization (express-validator)
               ├── Controller Logic
               ├── Database Operations (Mongoose -> MongoDB Atlas / Local)
               ├── File Pipelines (Multer -> AWS S3 / Local fallback -> Presigned URLs)
               └── Notification Dispatcher (Nodemailer HTML templates)
         <── JSON Response
   <── Redux Toolkit Store Updates ──> React UI Re-renders
```

---

## 👥 Dual-Level Role & Permissions Hierarchy

HireFlow separates access into two distinct layers:

### 1. Platform Role (`user.role`)
- **`candidate`**: Searches/filters jobs, builds profile, uploads resumes, 1-click applies, bookmarks positions, tracks application progression.
- **`company`**: Enters recruiter workspaces; permissions are determined by their internal company role.
- **`admin`**: Oversees the entire platform, approves or blocks pending companies, moderates job postings, and views platform-wide metrics.

### 2. Company Role (`membership.companyRole`)
| Company Role | Edit Company Profile | Invite / Manage Team | Job CRUD (Draft / Open / Close) | View All Applicants | Move Pipeline (Shortlist / Offer / Reject) | Assign Interviewers | Submit & View Evaluations |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (All feedback) |
| **HR Manager** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ (All feedback) |
| **Interviewer**| ❌ | ❌ | ❌ | ❌ (Assigned only) | ❌ | ❌ | ✅ (Own feedback only)|

---

## 🔄 End-to-End Recruitment Pipeline

```
Candidate Submits (Status: Applied)
        ↓
HR / Owner Reviews Candidate Profile & Presigned Resume
        ↓
Shortlisted (Status: Shortlisted)
        ↓
HR / Owner Assigns Interviewers (Status: Interview)
        ↓
Interviewer Conducts Screen & Submits Feedback (Rating 1-5, Comments, Recommendation)
        ↓
HR / Owner Reviews Evaluations ───> Offer Extended (Status: Offer)
        │
        └───> Rejected (Status: Rejected)
```
> **Rule Enforcement**: The server strictly validates transitions and rejects invalid regressions (e.g. `Offer` → `Applied` or from terminal `Rejected`). Every status shift appends to `statusHistory` with actor, timestamp, and optional note, triggering an automated Nodemailer notification.

---

## 🔐 Authentication & Session Workflow

1. **Login**: Server hashes passwords with **bcrypt (salt 10)**, returns a **15-minute JWT access token** in the response body, and sets a **7-day httpOnly refresh token cookie**.
2. **Authenticated Calls**: Axios automatically injects `Authorization: Bearer <token>`.
3. **Silent Refresh**: When the 15-minute access token expires with a `401 TOKEN_EXPIRED`, an **Axios interceptor** captures the failure, pauses queued requests, calls `/api/auth/refresh` (sending the httpOnly cookie), updates Redux with a fresh access token, and transparently replays the original requests.
4. **Logout**: Clears the httpOnly cookie and resets Redux state.

---

## 📄 Secure Resume Pipeline (S3 + Presigned URLs)

1. **Upload**: Candidate uploads PDF or DOCX file (under 2 MB) parsed via **Multer memory storage**.
2. **Storage**: The buffer is stored under an encrypted unique key in **AWS S3** (or the integrated local fallback storage).
3. **Presigned Access**: Resumes are **never made public**. When a recruiter views an applicant's resume, the server generates a **short-lived HMAC / S3 presigned URL** (15-minute validity), ensuring candidate data privacy.

---

## ⚡ 1-Click Demo Personas (Pre-Seeded)

The database includes pre-configured demo accounts for all roles. You can click **"Demo Logins"** in the navigation bar to sign in instantly with one tap:

| Persona | Email | Password | Role & Permissions |
|---|---|---|---|
| **Platform Admin** | `admin@hireflow.dev` | `AdminPassword123!` | Platform Governance, Company Approvals, Job Moderation |
| **TechCorp Owner** | `owner@techcorp.com` | `OwnerPassword123!` | Sarah Jenkins — Company Owner, Team Management, Full Pipeline |
| **TechCorp HR** | `hr@techcorp.com` | `HrPassword123!` | David Miller — HR Manager, Job CRUD, Candidate Pipeline |
| **TechCorp Interviewer** | `interviewer@techcorp.com` | `InterviewerPassword123!` | Elena Rostova — Assigned Applicants, Evaluation Ratings |
| **Candidate** | `candidate@hireflow.dev` | `CandidatePassword123!` | Marcus Chen — Profile, Resume, 1-Click Apply, Tracking |
| **Pending Recruiter** | `recruiter@startup.io` | `StartupPassword123!` | Alex Vance — Company pending administrator approval |

---

## 🛠️ Project Directory Structure

```
Job Website/
├── client/                     # Frontend (React 18, Vite, Redux Toolkit, Tailwind CSS)
│   ├── src/
│   │   ├── api/axiosClient.js  # Axios with token refresh interceptor & queue
│   │   ├── features/           # Redux Toolkit Slices (auth, jobs, applications, company, admin)
│   │   ├── components/         # StatusBadge, JobCard, FilterBar, ApplyModal, Recruiter Modals
│   │   ├── pages/              # Home, JobsList, JobDetails, Candidate & Recruiter Dashboards
│   │   ├── App.jsx             # React Router v6 with Role-Guarded Protected Routes
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js          # Dev server with proxy to :5000
│   └── tailwind.config.js
│
├── server/                     # Backend API (Node.js, Express, Mongoose, AWS S3, Nodemailer)
│   ├── src/
│   │   ├── config/             # MongoDB connection, S3 storage service, Nodemailer transporter
│   │   ├── models/             # User, Company, Membership, Invite, Job, CandidateProfile, Application, Feedback
│   │   ├── middleware/         # JWT protect, Role checks, Rate limiters, Multer upload, Validation
│   │   ├── controllers/        # auth, job, application, company, feedback, profile, admin
│   │   ├── routes/             # authRoutes, jobRoutes, applicationRoutes, companyRoutes, adminRoutes
│   │   ├── utils/              # JWT token generator, Email HTML templates
│   │   ├── scripts/seed.js     # Comprehensive seed dataset
│   │   └── tests/api.test.js   # Jest & Supertest integration tests
│   ├── package.json
│   └── .env.example
│
├── postman/
│   └── HireFlow_API_Collection.json   # Exported Postman collection
├── package.json                # Monorepo scripts (run server and client)
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a **MongoDB Atlas URI**

### 2. Install Dependencies
```bash
# Install root, backend, and frontend packages
npm run install:all
```

### 3. Configure Environment Variables
Backend `.env` (`server/.env`):
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/hireflow
JWT_ACCESS_SECRET=hireflow_jwt_access_secret_super_secure_key_2026
JWT_REFRESH_SECRET=hireflow_jwt_refresh_secret_super_secure_key_2026
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Frontend `.env` (`client/.env`):
```ini
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Demo Data
```bash
npm run seed
```

### 5. Run the Application
In terminal 1 (Backend API):
```bash
npm run server
# Runs Express on http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
npm run client
# Runs Vite on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Testing & Verification

### Running Automated Integration Tests (Jest & Supertest)
```bash
npm test
```
**Test Coverage:**
- Health check `GET /api/health`
- Auth login validation & cookie setting
- Role permissions: Candidate blocked from creating jobs (403)
- Role permissions: Interviewer blocked from updating application status (403)
- Keyword text search & multi-field filtering
- Duplicate application prevention (409 Conflict)

### Postman Collection
Import `postman/HireFlow_API_Collection.json` into Postman to test all endpoints across Candidate, Recruiter, and Admin roles.
