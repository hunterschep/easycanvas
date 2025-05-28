import { ChatListItem } from '@/types/chat';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Button } from '@/components/common/Button/Button';

interface ChatHistoryProps {
  chats: ChatListItem[];
  currentChatId?: string;
  isLoading: boolean;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  showHeader?: boolean;
  deletingChatIds?: Set<string>;
}

const ChatHistory = ({
  chats,
  currentChatId,
  isLoading,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  showHeader = true,
  deletingChatIds
}: ChatHistoryProps) => {
  const formatDate = (dateStr: string | Date): string => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return format(date, 'MMM d, yyyy');
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent triggering chat selection
    onDeleteChat(chatId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - conditionally rendered */}
      {showHeader && (
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl font-black tracking-tighter text-white">Your Chats</h2>
          <Button
            onClick={onNewChat}
            variant="secondary"
            className="flex-shrink-0 h-12 w-12 !p-0 flex items-center justify-center"
            title="New Chat"
          >
            <PlusIcon className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center space-y-3">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 text-sm">Loading chats...</p>
          </div>
        </div>
      ) : chats.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center space-y-4 lg:space-y-6 px-4">
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm sm:text-base">No chats yet</p>
            <p className="text-gray-500 text-xs sm:text-sm">Start your first conversation</p>
          </div>
          <Button
            onClick={onNewChat}
            variant="primary"
            className="text-sm sm:text-base"
          >
            Start a new chat
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 lg:space-y-3">
          {chats.map((chat) => {
            const isDeleting = deletingChatIds?.has(chat.chat_id) || false;
            return (
              <div
                key={chat.chat_id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  isDeleting ? 'opacity-50 pointer-events-none' : ''
                } ${
                  chat.chat_id === currentChatId ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                }`}
                onClick={() => !isDeleting && onSelectChat(chat.chat_id)}
              >
                <div className={`relative p-3 sm:p-4 rounded-lg border transition-all duration-200 group ${
                  chat.chat_id === currentChatId
                    ? 'bg-black border-blue-500/50'
                    : 'bg-black border-gray-800 hover:border-gray-700 hover:bg-gray-900/50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-medium text-white text-sm sm:text-base truncate mb-1">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1 sm:mb-2">
                        {formatDate(chat.updated_at)}
                      </p>
                      {chat.last_message && (
                        <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 leading-relaxed">
                          {chat.last_message}
                        </p>
                      )}
                    </div>
                    {isDeleting ? (
                      <div className="p-2 flex-shrink-0">
                        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleDeleteChat(e, chat.chat_id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all duration-200 rounded-md hover:bg-red-500/10 flex-shrink-0"
                        title="Delete chat"
                      >
                        <TrashIcon className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatHistory; 