import { useState } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6">
      {/* Logo and Heading */}
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-white mb-3">easycanvas</h1>
        <p className="text-lg text-gray-400">
          Sign up or log in with Google to get started
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 w-full max-w-md bg-gray-900 p-6 rounded-lg shadow-lg">
        {error && (
          <p className="text-sm text-red-500 text-center mb-4">{error}</p>
        )}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center bg-white text-black py-3 px-4 rounded-lg shadow-md hover:bg-gray-100 transition-all"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Log in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
