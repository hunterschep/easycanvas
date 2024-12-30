import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './components/login';
import Setup from './components/setup';
import Home from './components/home';
import AccountDetails from './components/AccountDetails';
import TermsOfService from './components/TermsOfService';
import CourseDetails from './components/CourseDetails';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/setup" 
          element={
            <ProtectedRoute requiresSetup>
              <Setup />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/account" 
          element={
            <ProtectedRoute>
              <AccountDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/course/:courseId" 
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;