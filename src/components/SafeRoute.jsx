import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export const GuestRoute = () => {
  const { session, user, loading } = useAuth();
  // Bypass redirect if in the middle of a registration success flow
  const isRegistering = sessionStorage.getItem('registration_in_progress') === 'true';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  // WAIT FOR TOTAL IDENTITY SIGNAL: Only redirect if session AND user are present
  // If session exists but user is null, stay on the page (profile sync is happening)
  const shouldRedirect = session && user && !isRegistering;

  return shouldRedirect ? <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace /> : <Outlet />;
};
