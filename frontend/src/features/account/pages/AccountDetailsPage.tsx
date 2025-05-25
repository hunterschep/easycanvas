import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AccountService } from '../services/account.service';
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { Button } from '@/components/common/Button/Button';
import type { UserSettings } from '../types';

export const AccountDetailsPage = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [canvasUrl, setCanvasUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDangerEditing, setIsDangerEditing] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await AccountService.getUserSettings();
        setSettings(data);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setCanvasUrl(data.canvasUrl);
        // Don't set API token - it's encrypted
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load account settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const updatedSettings = await AccountService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
      });
      setSettings(updatedSettings);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleDangerSave = async () => {
    try {
      if (!canvasUrl.endsWith('.instructure.com')) {
        setError('Please enter a valid Canvas URL (e.g., <yourschool>.instructure.com)');
        return;
      }

      const updatedSettings = await AccountService.updateCanvasIntegration(
        canvasUrl, 
        apiToken.trim() !== '' ? apiToken : undefined
      );
      
      setSettings(updatedSettings);
      setIsDangerEditing(false);
      setApiToken(''); // Clear token after save
    } catch (error) {
      console.error('Error updating Canvas settings:', error);
      setError('Failed to update Canvas settings. Please check your URL and API token.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await AccountService.deleteAccount();
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete account. Please try logging out and back in.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout showBackButton onBack={() => navigate('/home')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showBackButton onBack={() => navigate('/home')}>
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {/* Header with Avatar */}
        <div className="text-center">
          <div className="mb-4">
            {settings?.avatar_url ? (
              <img
                src={settings.avatar_url}
                alt="Profile"
                className="w-32 h-32 rounded-full border-2 border-gray-800 object-cover mx-auto"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-2 border-gray-800 bg-black flex items-center justify-center mx-auto">
                <span className="text-4xl text-gray-400">
                  {settings?.first_name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            Hi,{' '}<span className="text-gray-400">{settings?.first_name}</span>!
          </h1>
          <p className="text-gray-400">
            Manage your easyCanvas account preferences and integrations
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Account Overview */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-black border border-gray-800 rounded-lg p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Account Overview</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Email</span>
                  <p className="text-white">{settings?.email || 'No email set'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Canvas User ID</span>
                  <p className="text-white">{settings?.canvas_user_id}</p>
                </div>
                <div>
                  <span className="text-gray-400">Account Created</span>
                  <p className="text-white">{new Date(currentUser?.metadata.creationTime || '').toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Last Sign In</span>
                  <p className="text-white">{new Date(currentUser?.metadata.lastSignInTime || '').toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-black border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Profile Information</h2>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="secondary">
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-transparent border border-gray-800 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white placeholder-gray-600 transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-transparent border border-gray-800 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white placeholder-gray-600 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end gap-4 pt-4">
                  <Button onClick={() => setIsEditing(false)} variant="secondary">
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canvas Integration */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-red-800 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-black border border-red-900/50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-red-500">Canvas Integration</h2>
              {!isDangerEditing && (
                <Button onClick={() => setIsDangerEditing(true)} variant="danger">
                  Edit Integration
                </Button>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Canvas URL</label>
                  <input
                    type="text"
                    value={canvasUrl}
                    onChange={(e) => setCanvasUrl(e.target.value)}
                    disabled={!isDangerEditing}
                    className="w-full px-4 py-3 bg-transparent border border-gray-800 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white placeholder-gray-600 transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">API Token</label>
                  <input
                    type={isDangerEditing ? "text" : "password"}
                    value={isDangerEditing ? apiToken : '••••••••••••••••'}
                    onChange={(e) => setApiToken(e.target.value)}
                    disabled={!isDangerEditing}
                    placeholder={isDangerEditing ? "Enter new API token" : ""}
                    className="w-full px-4 py-3 bg-transparent border border-gray-800 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white placeholder-gray-600 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {isDangerEditing && (
                <div className="flex justify-end gap-4 pt-4">
                  <Button onClick={() => setIsDangerEditing(false)} variant="secondary">
                    Cancel
                  </Button>
                  <Button onClick={handleDangerSave} variant="danger">
                    Update Integration
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-red-900/50">
              <h3 className="text-xl font-bold text-red-500 mb-4">Delete Account</h3>
              <p className="text-gray-400 mb-6">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button onClick={handleDeleteAccount} variant="danger">
                Delete Account
              </Button>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}; 