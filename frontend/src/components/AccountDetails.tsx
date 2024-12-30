import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSettings, updateUserSettings, deleteUserAccount } from '../firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import Account from './Account';

interface UserSettings {
  first_name: string;
  last_name: string;
  avatar_url: string;
  canvasUrl: string;
  name: string;
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function AccountDetails() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        const data = await getUserSettings(currentUser.uid);
        setSettings(data);
        setFirstName(data.first_name);
        setLastName(data.last_name);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.uid || !settings) return;
    try {
      await updateUserSettings(currentUser.uid, {
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
      });
      setIsEditing(false);
      // Refresh settings
      const newSettings = await getUserSettings(currentUser.uid);
      setSettings(newSettings);
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = "DELETE";
    const userInput = prompt(
      `This action cannot be undone. This will permanently delete your account and remove all access to EasyCanvas.\n\nPlease type "${confirmText}" to confirm:`
    );

    if (userInput !== confirmText) {
      setError('Account deletion cancelled');
      return;
    }

    if (!currentUser?.uid) return;
    
    try {
      // First delete from backend (which handles both Firestore and Firebase Auth)
      await deleteUserAccount(currentUser.uid);
      // Then sign out
      await signOut();
      navigate('/login');
    } catch (error) {
      setError('Failed to delete account');
      console.error('Error deleting account:', error);
    }
  };

  const formatDate = (timestamp: UserSettings['updatedAt']) => {
    if (!timestamp || !timestamp.seconds) return 'Not available';
    
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  if (!settings) return null;

  const createdDate = formatDate(settings.updatedAt);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-all duration-200"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-black tracking-tighter">
                easy<span className="text-gray-500">canvas</span>
              </h1>
            </div>
            <Account />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Hello Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter mb-2">
            hey, {settings.first_name}!
          </h1>
        </div>
        
        {/* Main Content */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-black p-8 rounded-lg space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center mb-8">
              <img 
                src={settings.avatar_url} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-2 border-gray-800"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-transparent border border-gray-800 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-transparent border border-gray-800 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Canvas URL</label>
                <div className="px-4 py-3 border border-gray-800 rounded-lg text-gray-400">
                  {settings.canvasUrl}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Account Created</label>
                <div className="px-4 py-3 border border-gray-800 rounded-lg text-gray-400">
                  {createdDate}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-6">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="w-full bg-white hover:bg-gray-100 text-black rounded-lg p-3 font-medium transition-all duration-200"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full border border-gray-800 hover:border-gray-600 text-white rounded-lg p-3 font-medium transition-all duration-200"
                >
                  Edit Profile
                </button>
              )}

              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg p-3 font-medium transition-all duration-200"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}