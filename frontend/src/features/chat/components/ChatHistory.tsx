import { ChatListItem } from '@/types/chat';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface ChatHistoryProps {
  chats: ChatListItem[];
  currentChatId?: string;
  isLoading: boolean;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

const ChatHistory = ({
  chats,
  currentChatId,
  isLoading,
  onSelectChat,
  onNewChat,
  onDeleteChat
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Chats</h2>
        <button
          onClick={onNewChat}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          title="New Chat"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <p className="text-gray-500">Loading chats...</p>
        </div>
      ) : chats.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center">
          <p className="text-gray-500 mb-2">No chats yet</p>
          <button
            onClick={onNewChat}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Start a new chat
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.chat_id}
              className={`p-3 rounded-lg cursor-pointer flex justify-between items-start group ${
                chat.chat_id === currentChatId
                  ? 'bg-blue-100 hover:bg-blue-200'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => onSelectChat(chat.chat_id)}
            >
              <div className="overflow-hidden">
                <h3 className="font-medium text-sm truncate">{chat.title}</h3>
                <p className="text-xs text-gray-500">{formatDate(chat.updated_at)}</p>
                {chat.last_message && (
                  <p className="text-xs text-gray-600 mt-1 truncate">{chat.last_message}</p>
                )}
              </div>
              <button
                onClick={(e) => handleDeleteChat(e, chat.chat_id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500 transition-opacity"
                title="Delete chat"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory; 