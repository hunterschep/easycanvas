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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;