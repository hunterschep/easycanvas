import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserSettings } from '../firebase/firestore';

// Account.tsx
export default function Account() {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const {currentUser, signOut, hasCanvasToken} = useAuth();

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      try {
        if (!currentUser?.uid || !hasCanvasToken) return;
        
        const settings = await getUserSettings(currentUser.uid);
        if (!settings) return;

        setAvatarUrl(settings.avatar_url);
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };

    fetchAvatarUrl();
  }, [currentUser, hasCanvasToken]);

  return (
    <div className="flex items-center gap-4">
      {/* Avatar Container with Fixed Dimensions */}
      <div className="relative group cursor-pointer w-10 h-10" onClick={() => navigate('/account')}>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="User avatar" 
            className="relative w-10 h-10 rounded-full border border-gray-800 hover:border-gray-600 transition-all duration-200"
          />
        ) : (
          // Placeholder while loading
          <div className="relative w-10 h-10 rounded-full border border-gray-800 bg-gray-900 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {/* Sign Out Button */}
      <button
        onClick={signOut}
        className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-all duration-200"
      >
        Sign Out
      </button>
    </div>
  );
}