import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSetup?: boolean;
}

export const ProtectedRoute = ({ children, requiresSetup = false }: ProtectedRouteProps) => {
  const { user, loading, hasCanvasToken } = useAuth();

  if (loading) return null;

  if (!user) {
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