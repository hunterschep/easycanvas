import { useState } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup } from 'firebase/auth';
import Loading from './Loading';


const Login = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
      // The App component will handle navigation based on API key status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading message="Setting up your account..." />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-black p-4 sm:p-6 md:p-8">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-black p-8 sm:p-10 rounded-lg max-w-md w-full">
            <div className="space-y-6 text-center mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter">
                easy<span className="text-gray-500">canvas</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-400 font-light">
                streamline your Canvas experience
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              className="group relative w-full bg-white hover:bg-gray-100 text-black rounded-lg p-4 flex items-center justify-center space-x-3 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="font-medium">sign up or log in with Google</span>
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        made by <a href="https://linkedin.com/in/hunterscheppat/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">hunter scheppat</a>
      </p>
    </div>
  );
};

export default Login;
