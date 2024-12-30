import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { getUserSettings } from '../firebase/firestore';
import { User } from 'firebase/auth';

interface AuthContextType {
  loading: boolean;
  hasCanvasToken: boolean;
  currentUser: User | null;
  signOut: () => Promise<void>;
}

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

  const handleSignOut = async () => {
    await auth.signOut();
  };

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
          await getUserSettings(user.uid);
          setHasCanvasToken(true);
        } catch (error: any) {
          if (error.message === 'NEW_USER') {
            setHasCanvasToken(false);
          } else {
            console.error('Error fetching user settings:', error);
            setHasCanvasToken(false);
          }
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
    signOut: handleSignOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;