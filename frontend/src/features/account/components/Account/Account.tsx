import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/services/user.service';
import { Button } from '@/components/common/Button/Button';

export const Account = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

  const { data: settings } = useQuery({
    queryKey: ['userSettings', currentUser?.uid],
    queryFn: UserService.getSettings,
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  if (!currentUser) return null;

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
      <div className="relative flex items-center gap-2">
        <Button
          onClick={() => navigate('/account')}
          variant="secondary"
          className="flex items-center gap-2 h-10"
        >
          {settings?.avatar_url ? (
            <img
              src={settings.avatar_url}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-gray-800 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full border border-gray-800 bg-black flex items-center justify-center">
              <span className="text-gray-400 text-sm">
                {currentUser.displayName?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
          <span className="text-sm hidden sm:inline">
            {currentUser.displayName}
          </span>
        </Button>
        
        <Button
          onClick={signOut}
          variant="secondary"
          className="h-10 text-sm"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}; 