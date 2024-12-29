import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSetup?: boolean;
}

export const ProtectedRoute = ({ children, requiresSetup = false }: ProtectedRouteProps) => {
  const { currentUser, loading, hasCanvasToken } = useAuth();

  if (loading) {
    return <Loading message="Loading your account..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requiresSetup && hasCanvasToken) {
    return <Navigate to="/home" />;
  }

  if (!requiresSetup && !hasCanvasToken) {
    return <Navigate to="/setup" />;
  }

  return <>{children}</>;
};