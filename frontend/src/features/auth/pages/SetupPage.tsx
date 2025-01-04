import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth.service';
import { Button } from '@/components/common/Button/Button';

interface SetupStep {
  title: string;
  description: string;
}

const SETUP_STEPS: SetupStep[] = [
  {
    title: 'Enter Your Canvas URL',
    description: 'Enter your institution\'s Canvas URL (e.g., yourschool.instructure.com)'
  },
  {
    title: 'Generate Access Token',
    description: 'Follow these steps to create your Canvas access token'
  },
  {
    title: 'Complete Setup',
    description: 'Paste your Canvas access token to finish setup'
  }
];

export const SetupPage = () => {
  const [step, setStep] = useState(1);
  const [apiToken, setApiToken] = useState('');
  const [canvasUrl, setCanvasUrl] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!canvasUrl.endsWith('.instructure.com')) {
      setError('Please enter a valid Canvas URL (e.g., <yourschool>.instructure.com)');
      return;
    }

    if (!currentUser) {
      setError('No user is logged in');
      return;
    }

    try {
      await AuthService.saveUserSettings(canvasUrl, apiToken);
      window.location.href = '/select-courses';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Progress Steps */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black rounded-lg p-6">
            <div className="flex justify-between mb-2">
              {SETUP_STEPS.map((_, index) => (
                <div key={index + 1} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-200
                      ${step >= index + 1 
                        ? 'border-white text-white' 
                        : 'border-gray-700 text-gray-700'}`}
                  >
                    {index + 1}
                  </div>
                  <span 
                    className={`text-xs mt-2 transition-colors duration-200 hidden sm:block
                      ${step >= index + 1 ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {SETUP_STEPS[index].title}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-gray-800 rounded-full mt-4">
              <div 
                className="h-1 bg-white rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-2">
                easy<span className="bg-gradient-to-r from-gray-200 to-gray-500 inline-block text-transparent bg-clip-text">canvas</span>
              </h1>
              <p className="text-sm text-gray-400">Complete your account setup</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">{SETUP_STEPS[0].title}</h3>
                  <p className="text-gray-400">{SETUP_STEPS[0].description}</p>
                  <input
                    type="text"
                    placeholder="yourschool.instructure.com"
                    value={canvasUrl}
                    onChange={(e) => setCanvasUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-gray-800 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white placeholder-gray-600 transition-all"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">{SETUP_STEPS[1].title}</h3>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
                    <ol className="list-decimal list-inside space-y-3 text-gray-400">
                      <li>Click here to open your Canvas settings:{" "}
                        <a 
                          href={`https://${canvasUrl}/profile/settings`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-gray-300 underline transition-colors duration-200"
                        >
                          {canvasUrl}/profile/settings
                        </a>
                      </li>
                      <li>Scroll to <span className="text-white">Approved Integrations</span></li>
                      <li>Click <span className="text-white">+ New Access Token</span></li>
                      <li>Copy your <span className="text-white">Access Token</span></li>
                    </ol>
                  </div>
                </div>
              )}

              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-white">{SETUP_STEPS[2].title}</h3>
                  <p className="text-gray-400">{SETUP_STEPS[2].description}</p>
                  <input
                    type="password"
                    placeholder="Paste your access token"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-gray-800 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white placeholder-gray-600 transition-all"
                  />
                  <Button type="submit" className="w-full">
                    Complete Setup
                  </Button>
                </form>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button onClick={prevStep} variant="secondary">
                  Back
                </Button>
              )}
              {step < 3 && (
                <Button onClick={nextStep} className={`${step > 1 ? '' : 'ml-auto'}`}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 