import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { CourseSelectPage } from '@/features/auth/pages/CourseSelectPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      throwOnError: true
    },
    mutations: {
      throwOnError: true
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/setup" element={<ProtectedRoute requiresSetup><SetupPage /></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><AccountDetailsPage /></ProtectedRoute>} />
              <Route path="/course/:courseId" element={<ProtectedRoute><CourseDetailsPage /></ProtectedRoute>} />
              <Route path="/course/:courseId/assignment/:assignmentId" element={<ProtectedRoute><AssignmentDetailsPage /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/select-courses" element={<CourseSelectPage />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;