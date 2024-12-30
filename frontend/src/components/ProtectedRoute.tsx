import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSetup?: boolean;
}

export const ProtectedRoute = ({ children, requiresSetup = false }: ProtectedRouteProps) => {
  const { currentUser, loading, hasCanvasToken } = useAuth();

  // Always show loading until we have all the information we need
  if (loading || (currentUser && hasCanvasToken === undefined)) {
    return <Loading message="Loading your account..." />;
  }

  // Then handle authentication
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Only show setup/home when we're absolutely sure about hasCanvasToken
  if (requiresSetup) {
    if (hasCanvasToken) {
      return <Navigate to="/home" />;
    }
  } else {
    if (!hasCanvasToken) {
      return <Navigate to="/setup" />;
    }
  }

  return <>{children}</>;
};