import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/common/Button/Button';
import { Loading } from '@/components/common/Loading';

export const LoginPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const navigate = useNavigate();
  const { currentUser, hasCanvasToken, initialAuthCheckComplete, loading } = useAuth();

  console.log('LoginPage render:', { 
    currentUser: !!currentUser, 
    hasCanvasToken, 
    initialAuthCheckComplete, 
    signingIn, 
    loading 
  });

  // Handle automatic redirects when auth state changes
  useEffect(() => {
    // Only redirect after auth check is complete, user exists, and we're in the process of signing in
    if (initialAuthCheckComplete && !loading && currentUser && signingIn) {
      // Log the state to help with debugging
      console.log('Auth state on login:', { 
        hasCanvasToken, 
        initialAuthCheckComplete, 
        signingIn, 
        currentUser: !!currentUser 
      });
      
      // Navigate based on whether they have a canvas token
      if (hasCanvasToken) {
        navigate('/home');
      } else {
        navigate('/setup');
      }
    }
  }, [currentUser, hasCanvasToken, initialAuthCheckComplete, navigate, signingIn, loading]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSigningIn(true);
      await AuthService.signInWithGoogle();
      // Navigation will be handled by the useEffect
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      console.error('Sign in error:', err);
      setSigningIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen until we know whether the user has a Canvas token
  if (signingIn || (currentUser && loading)) {
    return <Loading message="Connecting your account..." />;
  }

  // Wrap the UI rendering in an error boundary
  try {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative group max-w-md w-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black rounded-lg p-8 space-y-8">
            {/* Logo and Heading */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter">
                easy<span className="bg-gradient-to-r from-gray-200 to-gray-500 inline-block text-transparent bg-clip-text">canvas</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-400 font-light">
                Streamline your Canvas experience with AI
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <div className="space-y-6">
              <Button
                onClick={handleGoogleSignIn}
                isLoading={isLoading}
                className="w-full justify-center bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white border border-gray-800 hover:border-gray-700 transition-all duration-200 py-3"
              >
                <div className="flex items-center justify-center gap-3">
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  <span className="font-medium">Continue with Google</span>
                </div>
              </Button>

              {/* Terms and Privacy */}
              <p className="text-xs text-center text-gray-500">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error('Error rendering login page:', err);
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <h1 className="text-xl text-red-500">Error loading login page</h1>
        <p className="text-white mt-4">Please refresh the page or try again later.</p>
      </div>
    );
  }
}; 