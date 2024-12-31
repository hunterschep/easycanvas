import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/config/firebase.config';
import { AuthService } from '../services/auth.service';
import type { AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  hasCanvasToken: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCanvasToken, setHasCanvasToken] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          setCurrentUser(null);
          setHasCanvasToken(false);
          setLoading(false);
          return;
        }

        setCurrentUser(user);
        
        try {
          await AuthService.getUserSettings();
          setHasCanvasToken(true);
        } catch (error: any) {
          console.error('Settings error:', error);
          setHasCanvasToken(false);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    hasCanvasToken,
    signOut: AuthService.signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 