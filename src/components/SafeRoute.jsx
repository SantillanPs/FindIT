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
  return token ? <Navigate to="/" replace /> : <Outlet />;
};
