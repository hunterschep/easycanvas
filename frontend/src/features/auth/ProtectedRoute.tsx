import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loading } from '@/components/common/Loading';

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
    return <Navigate to="/login" replace />;
  }

  if (requiresSetup && hasCanvasToken) {
    return <Navigate to="/home" replace />;
  }

  if (!requiresSetup && !hasCanvasToken) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}; 