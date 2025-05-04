import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loading } from '@/components/common/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSetup?: boolean;
}

export const ProtectedRoute = ({ children, requiresSetup = false }: ProtectedRouteProps) => {
  const { currentUser, loading, hasCanvasToken, initialAuthCheckComplete } = useAuth();
  const location = useLocation();

  // Define static pages that don't need auth loading screens
  const staticPages = ['/terms', '/privacy']; // Removed root path from static pages
  const isStaticPage = staticPages.includes(location.pathname);

  // Log the protection state for debugging
  console.log('ProtectedRoute state:', {
    path: location.pathname,
    currentUser: !!currentUser,
    hasCanvasToken,
    loading,
    initialAuthCheckComplete
  });

  // For static pages, skip the loading screen
  if (isStaticPage) {
    return <>{children}</>;
  }

  // Only show loading for non-static pages
  if (loading || !initialAuthCheckComplete) {
    return <Loading message="Preparing your content..." />;
  }

  // If not logged in, go to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // For setup page: If user already has canvas token, redirect to home
  if (requiresSetup && hasCanvasToken) {
    return <Navigate to="/home" replace />;
  }

  // For non-setup pages: If user doesn't have canvas token, redirect to setup
  if (!requiresSetup && !hasCanvasToken) {
    return <Navigate to="/setup" replace />;
  }

  // If we get here, the user is in the right place
  return <>{children}</>;
}; 