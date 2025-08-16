import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth.service';
import { Button } from '@/components/common/Button/Button';
import { Loading } from '@/components/common/Loading';
import { SectionCard } from '@/components/common/Card/Card';
import { 
  GlobeAltIcon, 
  KeyIcon, 
  CheckCircleIcon, 
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

interface SetupStep {
  title: string;
  description: string;
}

const SETUP_STEPS: SetupStep[] = [
  {
    title: 'Canvas URL',
    description: 'Connect to your institution'
  },
  {
    title: 'Access Token',
    description: 'Generate authentication'
  },
  {
    title: 'Complete',
    description: 'Finish setup'
  }
];

export const SetupPage = () => {
  const [step, setStep] = useState(1);
  const [apiToken, setApiToken] = useState('');
  const [canvasUrl, setCanvasUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!canvasUrl.endsWith('.instructure.com')) {
      setError('Please enter a valid Canvas URL (e.g., <yourschool>.instructure.com)');
      setIsSubmitting(false);
      return;
    }

    if (!currentUser) {
      setError('No user is logged in');
      setIsSubmitting(false);
      return;
    }

    try {
      await AuthService.saveUserSettings(canvasUrl, apiToken);
      window.location.href = '/select-courses';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  if (isSubmitting) {
    return <Loading message="Configuring your Canvas access..." />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter">
            easy<span className="bg-gradient-to-r from-gray-200 to-gray-500 inline-block text-transparent bg-clip-text">canvas</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Connect your Canvas account to get started with AI-powered course management
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="flex items-center space-x-4 sm:space-x-8">
            {SETUP_STEPS.map((stepInfo, index) => (
              <div key={index + 1} className="flex items-center">
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      step >= index + 1 
                        ? 'border-white bg-white text-black shadow-lg' 
                        : step === index + 1
                        ? 'border-white text-white shadow-md'
                        : 'border-gray-700 text-gray-700'
                    }`}
                  >
                    {step > index + 1 ? (
                      <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <span className="text-sm sm:text-base font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                      step >= index + 1 ? 'text-white' : 'text-gray-500'
                    }`}>
                      {stepInfo.title}
                    </p>
                    <p className={`text-xs transition-colors duration-300 hidden sm:block ${
                      step >= index + 1 ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {stepInfo.description}
                    </p>
                  </div>
                </div>
                {index < SETUP_STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-4 transition-colors duration-300 ${
                    step > index + 1 ? 'bg-white' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {step === 1 && (
            <SectionCard
              title="Connect Your Canvas"
              icon={<GlobeAltIcon className="w-8 h-8 text-blue-400" />}
              size="lg"
            >
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3">
                  <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">Need help finding your Canvas URL?</p>
                    <p>It's usually in the format: <span className="text-white font-mono">yourschool.instructure.com</span></p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Canvas Institution URL
                  </label>
                  <input
                    type="text"
                    placeholder="yourschool.instructure.com"
                    value={canvasUrl}
                    onChange={(e) => setCanvasUrl(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border border-gray-800 rounded-xl focus:border-white focus:ring-2 focus:ring-white/20 text-white placeholder-gray-500 transition-all text-lg"
                    autoComplete="url"
                    autoFocus
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {step === 2 && (
            <SectionCard
              title="Generate Access Token"
              icon={<KeyIcon className="w-8 h-8 text-yellow-400" />}
              size="lg"
            >
              <div className="space-y-6">
                <p className="text-gray-300 text-lg">
                  Follow these steps to create your Canvas access token:
                </p>
                
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">Canvas Settings</h4>
                    <Button
                      onClick={() => window.open(`https://${canvasUrl}/profile/settings`, '_blank')}
                      variant="secondary"
                      size="sm"
                      leftIcon={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                    >
                      Open Canvas
                    </Button>
                  </div>
                  
                  <ol className="list-decimal list-inside space-y-3 text-gray-300">
                    <li>Navigate to your Canvas profile settings</li>
                    <li>Scroll down to <span className="text-white font-medium">Approved Integrations</span></li>
                    <li>Click <span className="text-white font-medium">+ New Access Token</span></li>
                    <li>Enter a purpose (e.g., "EasyCanvas Integration")</li>
                    <li>Click <span className="text-white font-medium">Generate Token</span></li>
                    <li>Copy the generated token immediately</li>
                  </ol>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mt-4">
                    <p className="text-yellow-200 text-sm flex items-start space-x-2">
                      <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Important:</strong> Copy the token immediately as it won't be shown again!</span>
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {step === 3 && (
            <SectionCard
              title="Complete Setup"
              icon={<CheckCircleIcon className="w-8 h-8 text-green-400" />}
              size="lg"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Canvas Access Token
                  </label>
                  <input
                    type="password"
                    placeholder="Paste your Canvas access token here"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border border-gray-800 rounded-xl focus:border-white focus:ring-2 focus:ring-white/20 text-white placeholder-gray-500 transition-all text-lg"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <p className="text-green-200 text-sm flex items-start space-x-2">
                    <CheckCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Your token will be securely encrypted and stored. You're almost done!</span>
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  fullWidth
                  disabled={!apiToken.trim()}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Setting up your account...' : 'Complete Setup & Continue'}
                </Button>
              </form>
            </SectionCard>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6">
            {step > 1 ? (
              <Button onClick={prevStep} variant="secondary" size="lg">
                ← Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < 3 && (
              <Button 
                onClick={nextStep} 
                variant="primary" 
                size="lg"
                disabled={step === 1 && !canvasUrl.trim()}
              >
                Continue →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 