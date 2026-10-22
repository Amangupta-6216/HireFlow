import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuth } from './features/auth/authSlice';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import CompanyProtectedRoute from './components/common/CompanyProtectedRoute';

// Public Pages
import Home from './pages/Home';
import JobsList from './pages/JobsList';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AcceptInvite from './pages/AcceptInvite';
import DashboardDispatcher from './pages/DashboardDispatcher';
import NotFound from './pages/NotFound';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import JobManagementPage from './pages/recruiter/JobManagementPage';
import JobApplicantsPage from './pages/recruiter/JobApplicantsPage';
import TeamManagementPage from './pages/recruiter/TeamManagementPage';
import CompanyProfilePage from './pages/recruiter/CompanyProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Silently restore session on mount via httpOnly refresh token cookie
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobsList />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />

            {/* Smart Dashboard Dispatcher */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardDispatcher />
                </ProtectedRoute>
              }
            />

            {/* Candidate Protected Routes */}
            <Route
              path="/candidate/dashboard"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/profile"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <CandidateProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/applications"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <MyApplicationsPage />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Protected Routes */}
            <Route
              path="/recruiter/dashboard"
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/applicants"
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <JobApplicantsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs"
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyProtectedRoute allowedCompanyRoles={['owner', 'hr']}>
                    <JobManagementPage />
                  </CompanyProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/team"
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyProtectedRoute allowedCompanyRoles={['owner']}>
                    <TeamManagementPage />
                  </CompanyProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/company-profile"
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyProtectedRoute allowedCompanyRoles={['owner']}>
                    <CompanyProfilePage />
                  </CompanyProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
