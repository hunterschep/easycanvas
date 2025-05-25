import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SetupPage } from '@/features/auth/pages/SetupPage';
import { HomePage } from '@/features/courses/pages/HomePage';
import { ChatPage } from '@/features/chat/pages/ChatPage';
import { AccountDetailsPage } from '@/features/account/pages/AccountDetailsPage';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { CourseSelectPage } from '@/features/auth/pages/CourseSelectPage';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Loading } from '@/components/common/Loading';
import { queryClient } from '@/config/query-client';
import { useEffect } from 'react';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Component to handle routing based on auth state
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { currentUser, hasCanvasToken, loading, initialAuthCheckComplete } = useAuth();
  const location = useLocation();

  // Effect to reset React Query cache when auth state changes
  useEffect(() => {
    if (!loading && initialAuthCheckComplete && !currentUser) {
      // If logged out, clear the QueryClient cache
      queryClient.clear();
    }
  }, [currentUser, initialAuthCheckComplete, loading]);

  // Debug logging
  console.log('AuthRedirect state:', { 
    path: location.pathname,
    currentUser: !!currentUser,
    hasCanvasToken,
    loading,
    initialAuthCheckComplete
  });

  // Define static pages that don't need auth and should render immediately
  const staticPages = ['/terms', '/privacy'];
  const isStaticPage = staticPages.includes(location.pathname);

  // For static pages, don't show loading screen, just render the page immediately
  if (isStaticPage) {
    return <>{children}</>;
  }

  // For non-static pages, show loading state while auth is being checked
  if (loading || !initialAuthCheckComplete) {
    return <Loading message="Verifying your access..." />;
  }

  // For login page, redirect authenticated users appropriately
  if (location.pathname === '/login' && currentUser) {
    console.log('Auth redirect from login:', { hasCanvasToken, currentUser: !!currentUser });
    return hasCanvasToken ? <Navigate to="/chat" replace /> : <Navigate to="/setup" replace />;
  }

  // Handle setup page - redirect to home if user already has token
  if (location.pathname === '/setup' && currentUser && hasCanvasToken) {
    return <Navigate to="/chat" replace />;
  }

  // Handle protected routes - redirect to login if no user
  if (!isStaticPage && 
      location.pathname !== '/login' && 
      !currentUser) {
    console.log('Protected route redirect to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Component that sets up query persistence based on the current user
function QueryPersistenceSetup() {
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (currentUser?.uid) {
      // Set up user-specific query persistence
      const localStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
        key: `REACT_QUERY_OFFLINE_CACHE_${currentUser.uid}`, // User-specific cache key
      });
      
      persistQueryClient({
        queryClient,
        persister: localStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      });
      
      console.log(`Set up query persistence for user: ${currentUser.uid}`);
    }
  }, [currentUser?.uid]);
  
  return null; // This component doesn't render anything
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <QueryPersistenceSetup />
            <AuthRedirect>
              <Routes>
                {/* Root routes first - order matters */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/setup" element={<ProtectedRoute requiresSetup><SetupPage /></ProtectedRoute>} />
                
                {/* Protected routes */}
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountDetailsPage /></ProtectedRoute>} />
                
                {/* Public routes */}
                <Route path="/select-courses" element={<CourseSelectPage />} />
                
                {/* Catch all for non-existent routes */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </AuthRedirect>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

export default App;