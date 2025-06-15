import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/config/firebase.config';
import { AuthService } from '../services/auth.service';
import type { AuthContextType } from '../types';
import { useLocation } from 'react-router-dom';
import { Loading } from '@/components/common/Loading';

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  hasCanvasToken: false,
  initialAuthCheckComplete: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCanvasToken, setHasCanvasToken] = useState(false);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const [checkingSettings, setCheckingSettings] = useState(false);
  const location = useLocation();

  // Define static pages that don't need auth check loading screens
  const staticPages = ['/terms', '/privacy'];
  const isStaticPage = staticPages.includes(location.pathname);

  // Separate effect for auth state changes
  useEffect(() => {
    console.log('🔐 Setting up auth state listener');
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('🔐 Auth state changed:', { 
        hasUser: !!user, 
        userId: user?.uid, 
        isPageRefresh: performance.navigation?.type === 1,
        timestamp: new Date().toISOString()
      });
      
      setCurrentUser(user);
      // If no user, we can immediately mark everything as complete
      if (!user) {
        console.log('🔐 No user, marking auth complete');
        setHasCanvasToken(false);
        setLoading(false);
        setInitialAuthCheckComplete(true);
      }
    });

    return () => {
      console.log('🔐 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Separate effect for fetching user settings when user changes
  useEffect(() => {
    const checkUserSettings = async () => {
      if (!currentUser) return;
      
      console.log('🔐 Checking user settings for:', currentUser.uid);
      setCheckingSettings(true);
      try {
        await AuthService.getUserSettings();
        console.log('🔐 User settings found, has canvas token');
        setHasCanvasToken(true);
      } catch (error) {
        console.error('🔐 Settings error:', error);
        setHasCanvasToken(false);
      } finally {
        console.log('🔐 Finished checking settings, marking auth complete');
        setCheckingSettings(false);
        setLoading(false);
        setInitialAuthCheckComplete(true);
      }
    };

    if (currentUser) {
      checkUserSettings();
    }
  }, [currentUser]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔐 AuthProvider state update:', {
      currentUser: !!currentUser,
      loading,
      hasCanvasToken,
      initialAuthCheckComplete,
      checkingSettings,
      timestamp: new Date().toISOString()
    });
  }, [currentUser, loading, hasCanvasToken, initialAuthCheckComplete, checkingSettings]);

  const value = {
    currentUser,
    loading: loading || checkingSettings,
    hasCanvasToken,
    initialAuthCheckComplete,
    signOut: AuthService.signOut
  };

  // For static pages, don't show loading screen during initial auth check
  // This prevents a jarring flash on page refresh
  if (!initialAuthCheckComplete && !isStaticPage) {
    console.log('🔐 Showing auth loading screen');
    return <Loading message="Preparing your dashboard..." />;
  }

  console.log('🔐 AuthProvider rendering children');
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 