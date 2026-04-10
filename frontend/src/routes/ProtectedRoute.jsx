import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/Spinner';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  // Wait for auto-login check to complete before redirecting
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.is_staff) return <Navigate to="/dashboard" replace />;
  return children;
}
