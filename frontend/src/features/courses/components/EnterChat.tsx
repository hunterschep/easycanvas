import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ChatListItem } from '@/types/chat';
import { getUserChats } from '@/services/chatService';
import { getMarkdownPreview } from '@/utils/markdown.utils';
import { Button } from '@/components/common/Button/Button';
import { SectionCard } from '@/components/common/Card/Card';

export const EnterChat = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's chat history on component mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userChats = await getUserChats();
        setChats(userChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleStartChat = () => {
    navigate('/chat');
  };

  const handleSelectChat = (chatId: string) => {
    navigate(`/chat?id=${chatId}`);
  };

  const formatDate = (dateStr: string | Date): string => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return format(date, 'MMM d');
  };

  const recentChats = chats.slice(0, 3); // Show top 3 most recent chats

  return (
    <SectionCard 
      title="AI Chat Assistant"
      icon={<SparklesIcon className="w-8 h-8 text-blue-400" />}
      variant="blue"
      size="lg"
      className="h-full"
    >
      <div className="flex flex-col h-full">
        {/* Compact Header */}
        <div className="-mt-2 sm:-mt-4 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-1">
                <span className="text-xs font-medium text-blue-400">GPT-5</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Online</span>
              </div>
            </div>
            {chats.length > 0 && (
              <span className="text-xs glass-text-secondary">
                {chats.length} conversation{chats.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <p className="text-gray-300 text-base leading-relaxed">
            {chats.length > 0 
              ? "Continue a previous conversation or start fresh" 
              : "Your personal academic AI assistant for courses, assignments, and study strategies"
            }
          </p>
        </div>

        {/* Chat History Section - Flexible content area */}
        <div className="flex-1 flex flex-col min-h-0 py-4">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center glass-chip p-4">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="glass-text-secondary text-sm">Loading...</p>
              </div>
            </div>
          ) : recentChats.length > 0 ? (
            <div className="space-y-3 flex-1 min-h-0">
              <h4 className="text-sm font-medium glass-text-primary flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-blue-400" />
                Recent Conversations
              </h4>
              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
                {recentChats.map((chat) => (
                  <div
                    key={chat.chat_id}
                    onClick={() => handleSelectChat(chat.chat_id)}
                    className="glass-chip p-3 cursor-pointer transition-all duration-200 hover:bg-[rgba(17,25,40,0.24)] group flex-shrink-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <h5 className="font-medium glass-text-primary text-sm group-hover:text-blue-100 transition-colors duration-200 truncate flex-1 pr-2">
                          {chat.title}
                        </h5>
                        <span className="text-xs glass-text-secondary flex-shrink-0">
                          {formatDate(chat.updated_at)}
                        </span>
                      </div>
                      {chat.last_message && (
                        <p className="text-xs glass-text-secondary line-clamp-2 leading-relaxed">
                          {getMarkdownPreview(chat.last_message, 80)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {chats.length > 3 && (
                <button
                  onClick={handleStartChat}
                  className="w-full text-xs glass-text-secondary hover:glass-text-primary transition-colors duration-200 py-2 flex-shrink-0"
                >
                  View all {chats.length} conversations →
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="text-center glass-chip p-4">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-blue-400 mx-auto mb-2 opacity-60" />
                <p className="glass-text-secondary text-sm mb-1">No conversations yet</p>
                <p className="glass-text-secondary text-xs">Start your first chat below</p>
              </div>
            </div>
          )}
        </div>

        {/* Start Chat Button - Fixed at bottom */}
        <div className="flex-shrink-0 pt-2">
          <Button
            onClick={handleStartChat}
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<PlusIcon className="w-5 h-5" />}
            className="py-3"
          >
            Start New Chat
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Available 24/7 • Powered by AI
          </p>
        </div>
      </div>
    </SectionCard>
  );
}; 