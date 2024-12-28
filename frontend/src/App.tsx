import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { getUserSettings } from './firebase/firestore';
import Login from './components/login';
import Setup from './components/setup';
import Home from './components/home';
import Loading from './components/loading';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const settings = await getUserSettings(user.uid);
          setHasApiKey(!!settings?.apiToken);
        } catch (error) {
          console.error('Error checking user settings:', error);
          setHasApiKey(false);
        }
      } else {
        setHasApiKey(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show loading screen until we have both user and API key status
  if (loading || (user && hasApiKey === null)) {
    return <Loading message="Setting up your account..." />;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to={hasApiKey ? "/" : "/setup"} /> : <Login />} 
        />
        <Route 
          path="/setup" 
          element={
            user ? (
              hasApiKey ? <Navigate to="/" /> : <Setup />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/" 
          element={
            user ? (
              hasApiKey ? <Home /> : <Navigate to="/setup" />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;