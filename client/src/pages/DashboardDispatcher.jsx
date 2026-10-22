import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const DashboardDispatcher = () => {
  const { user, isAuthenticated, initialChecking } = useSelector((state) => state.auth);

  if (initialChecking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'candidate') {
    return <Navigate to="/candidate/dashboard" replace />;
  }

  if (user.role === 'company') {
    return <Navigate to="/recruiter/dashboard" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

export default DashboardDispatcher;
