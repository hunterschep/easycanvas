import { useState } from 'react';
import { auth } from '../firebase/config';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { saveUserSettings } from '../firebase/firestore';

const Setup = () => {
    const [step, setStep] = useState(1);
    const [apiToken, setApiToken] = useState('');
    const [canvasUrl, setCanvasUrl] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
  
      // Validate Canvas URL format
      if (!canvasUrl.endsWith('.instructure.com')) {
        setError('Please enter a valid Canvas URL (e.g., bostoncollege.instructure.com)');
        return;
      }
  
      const user = auth.currentUser;
      if (user) {
        try {
          await saveUserSettings(user.uid, canvasUrl, apiToken);
          navigate('/');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } else {
        setError('No user is logged in');
      }
    };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 sm:p-6 md:p-8">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((num) => (
            <span key={num} className={`text-sm ${step >= num ? 'text-white' : 'text-gray-600'}`}>
              Step {num}
            </span>
          ))}
        </div>
        <div className="h-1 w-full bg-gray-800 rounded-full">
          <div 
            className="h-1 bg-white rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Container with Gradient Border */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-black p-8 sm:p-10 rounded-lg w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-2">
              easy<span className="text-gray-500">canvas</span>
            </h1>
            <p className="text-sm text-gray-400">Complete your account setup</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Steps Content */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Enter Your Canvas URL</h3>
                <p className="text-gray-400 leading-relaxed">
                  Please enter your institution's Canvas URL (e.g., bostoncollege.instructure.com)
                </p>
                <input
                  type="text"
                  placeholder="yourschool.instructure.com"
                  value={canvasUrl}
                  onChange={(e) => setCanvasUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-gray-800 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white placeholder-gray-600 transition-all"
                  required
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">How to Get Your Canvas Access Token</h3>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
                  <p className="text-gray-400 leading-relaxed">
                    1. Go to your Canvas URL: <span className="text-white">{canvasUrl}</span>
                    <br />
                    2. Navigate to <span className="text-white">Account → Settings</span>
                    <br />
                    3. Scroll to <span className="text-white">Approved Integrations</span>
                    <br />
                    4. Click <span className="text-white">+ New Access Token</span>
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-white">Enter Your Canvas Access Token</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Paste your token here"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-gray-800 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white placeholder-gray-600 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-gray-100 text-black rounded-lg p-3 font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Complete Setup
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white rounded-lg transition-all duration-200"
              >
                Back
              </button>
            )}
            {step < 3 && (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-white hover:bg-gray-100 text-black rounded-lg ml-auto transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;
