import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SetupPage } from '@/features/auth/pages/SetupPage';
import { HomePage } from '@/features/courses/pages/HomePage';
import { AccountDetailsPage } from '@/features/account/pages/AccountDetailsPage';
import TermsOfServicePage from '@/features/static-pages/pages/TermsOfServicePage';
import { CourseDetailsPage } from '@/features/courses/pages/CourseDetailsPage';
import { AssignmentDetailsPage } from '@/features/courses/pages/AssignmentDetailsPage';
import PrivacyPolicyPage from '@/features/static-pages/pages/PrivacyPolicyPage';
import { LandingPage } from '@/features/static-pages/pages/LandingPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { CourseSelectPage } from '@/features/auth/pages/CourseSelectPage';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useEffect } from 'react';
import { scrollToTop } from '@/utils/scroll';

// Component that scrolls to top on route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  return null;
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
          <ScrollToTop />
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/setup" element={<ProtectedRoute requiresSetup><SetupPage /></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><AccountDetailsPage /></ProtectedRoute>} />
              <Route path="/course/:courseId" element={<ProtectedRoute><CourseDetailsPage /></ProtectedRoute>} />
              <Route path="/course/:courseId/assignment/:assignmentId" element={<ProtectedRoute><AssignmentDetailsPage /></ProtectedRoute>} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/select-courses" element={<CourseSelectPage />} />
              <Route path="/" element={<LandingPage />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

export default App;