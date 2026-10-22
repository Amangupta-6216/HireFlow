import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const CompanyProtectedRoute = ({ children, allowedCompanyRoles = [] }) => {
  const { user, company, isAuthenticated, initialChecking } = useSelector((state) => state.auth);

  if (initialChecking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'company') {
    return <Navigate to="/login" replace />;
  }

  const currentRole = company?.role || 'interviewer';

  if (allowedCompanyRoles.length > 0 && !allowedCompanyRoles.includes(currentRole)) {
    return <Navigate to="/recruiter/dashboard" replace />;
  }

  return children;
};

export default CompanyProtectedRoute;
