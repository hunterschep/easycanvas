import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SetupPage } from '@/features/auth/pages/SetupPage';
import { HomePage } from '@/features/courses/pages/HomePage';
import { AccountDetailsPage } from '@/features/account/pages/AccountDetailsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { CourseSelectPage } from '@/features/auth/pages/CourseSelectPage';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Loading } from '@/components/common/Loading';

// Component to handle routing based on auth state
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { currentUser, hasCanvasToken, loading, initialAuthCheckComplete } = useAuth();
  const location = useLocation();

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
    return hasCanvasToken ? <Navigate to="/home" replace /> : <Navigate to="/setup" replace />;
  }

  // Handle setup page - redirect to home if user already has token
  if (location.pathname === '/setup' && currentUser && hasCanvasToken) {
    return <Navigate to="/home" replace />;
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      throwOnError: true
    },
    mutations: {
      throwOnError: true
    }
  }
});

// Set up query persistence
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <AuthRedirect>
              <Routes>
                {/* Root routes first - order matters */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/setup" element={<ProtectedRoute requiresSetup><SetupPage /></ProtectedRoute>} />
                
                {/* Protected routes */}
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
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