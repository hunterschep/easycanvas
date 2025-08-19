import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/services/user.service';
import { Button } from '@/components/common/Button/Button';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

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
      <Button
        onClick={() => navigate('/chat')}
        variant="secondary"
        size="sm"
        leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
        className="h-10 flex items-center"
      >
        <span className="hidden sm:inline">Chat</span>
      </Button>
      
      <Button
        onClick={() => navigate('/account')}
        variant="secondary"
        size="sm"
        leftIcon={
          avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-6 h-6 rounded-full border border-white/20 object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-full border border-white/20 glass-chip flex items-center justify-center flex-shrink-0">
              <span className="glass-text-primary text-xs">
                {displayName?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )
        }
        className="h-10 flex items-center"
      >
        <span className="hidden sm:inline">
          {displayName}
        </span>
      </Button>
      
      <Button
        onClick={signOut}
        variant="secondary"
        size="sm"
        className="h-10 flex items-center"
      >
        Logout
      </Button>
    </div>
  );
}; 