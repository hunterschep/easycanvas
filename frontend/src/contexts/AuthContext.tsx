import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { getUserSettings } from '../firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: any;
  loading: boolean;
  hasCanvasToken: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasCanvasToken: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasCanvasToken, setHasCanvasToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          await getUserSettings(user.uid);
          setHasCanvasToken(true);
          navigate('/home');
        } catch (error: any) {
          if (error.message.includes('404')) {
            setHasCanvasToken(false);
            navigate('/setup');
          }
        }
      }
      
      setLoading(false);
    });
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, hasCanvasToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 