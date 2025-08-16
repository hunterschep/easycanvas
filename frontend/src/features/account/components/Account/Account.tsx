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
  });

  if (!currentUser) return null;

  // Use Firebase user data as fallback if settings are not available or stale
  const displayName = settings?.first_name && settings?.last_name 
    ? `${settings.first_name} ${settings.last_name}`
    : currentUser.displayName || 'User';

  const avatarUrl = settings?.avatar_url || currentUser.photoURL;

  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
        <div className="relative">
          <Button
            onClick={() => navigate('/account')}
            variant="secondary"
            size="sm"
            leftIcon={
              avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-gray-800 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border border-gray-800 bg-black flex items-center justify-center">
                  <span className="text-gray-400 text-sm">
                    {displayName?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )
            }
            className="h-10"
          >
            <span className="hidden sm:inline">
              {displayName}
            </span>
          </Button>
        </div>
      </div>
      
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
        <div className="relative">
          <Button
            onClick={signOut}
            variant="secondary"
            size="sm"
            className="h-10"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}; 