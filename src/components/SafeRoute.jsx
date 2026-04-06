import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles, requireVerification = false }) => {
  const { user, loading, token } = useAuth();

  if (loading) return <div>Loading access...</div>;
  if (!token) return <Navigate to="/login" replace />;
  
  // Role check
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // Verification check for students
  if (requireVerification && user?.role === 'student' && !user?.is_verified) {
    return <Navigate to="/student" replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { token } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const isRegistered = searchParams.get('registered') === 'true';
  
  // Only redirect to landing if user has a token AND is NOT looking at a "Registration Success" view
  return (token && !isRegistered) ? <Navigate to="/" replace /> : <Outlet />;
};
