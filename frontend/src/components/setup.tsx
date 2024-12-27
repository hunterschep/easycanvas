import { useState } from 'react';
import { auth } from '../firebase/config';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Setup = () => {
  const [step, setStep] = useState(1);
  const [apiToken, setApiToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = auth.currentUser;
    if (user) {
      try {
        await updateProfile(user, {
          displayName: user.displayName,
          photoURL: user.photoURL,
          // Save the token to Firestore or Realtime Database (to be implemented)
        });
        navigate('/'); // Redirect to home page after successful setup
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
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Setup Your Account
        </h2>
        {error && (
          <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        )}
        <div className="space-y-6">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Why We Need Your Canvas Access Token
              </h3>
              <p className="text-gray-400">
                We use your Canvas API token to fetch your courses, assignments,
                and grades. This token is <span className="font-bold">read-only</span> and completely safe to share. It allows us to provide personalized features without compromising your account security.
              </p>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                How to Get Your Canvas Access Token
              </h3>
              <p className="text-gray-400 mb-4">
                Go to your institution's Canvas URL (
                <span className="italic">&lt;institution&gt;.instructure.com</span>
                ) and navigate to <strong>Profile &gt; Settings</strong>. Under Approved Integrations, create a new token and copy it.
              </p>
              <img
                src="https://via.placeholder.com/600x200.png?text=Canvas+Settings+Screenshot"
                alt="Canvas Settings"
                className="rounded-md"
              />
            </div>
          )}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h3 className="text-xl font-semibold text-white mb-3">
                Enter Your Canvas Access Token
              </h3>
              <p className="text-gray-400 mb-4">
                Paste your token below to connect your account.
              </p>
              <input
                type="text"
                placeholder="Enter your Canvas API Token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="w-full px-4 py-3 text-sm text-white bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400 mb-4"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
              >
                Save and Continue
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Back
            </button>
          )}
          {step < 3 && (
            <button
              onClick={nextStep}
              className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all ml-auto"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setup;
