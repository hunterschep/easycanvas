import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { Button } from '@/components/common/Button/Button';
import { Toast } from '@/components/common/Toast';
import { Bars3Icon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatHistory from '../components/ChatHistory';
import { ChatMessage, MessageRole, ChatListItem } from '@/types/chat';
import { sendMessage, getUserChats, getChatMessages, createChat, deleteChat } from '@/services/chatService';
import { estimateTokenCount, AVAILABLE_INPUT_TOKENS } from '@/utils/tokenCounter';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useSidebarState } from '@/hooks/useSidebarState';

// With 8k token limit, this allows for roughly 40 messages
// Assuming average message length of ~200 tokens
const MAX_CONTEXT_MESSAGES = 40;

export const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useSidebarState();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(() => searchParams.get('id') || undefined);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isFetchingChats, setIsFetchingChats] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isResumingChat, setIsResumingChat] = useState(false);
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  const [deletingChatIds, setDeletingChatIds] = useState<Set<string>>(new Set()); // Track chats being deleted
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });
  const processedParamsRef = useRef(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Handle URL parameters for new chat and auto-submit message
  useEffect(() => {
    if (!processedParamsRef.current) {
      const newChatParam = searchParams.get('newChat');
      const messageParam = searchParams.get('message');
      
      if (newChatParam === 'true' && messageParam) {
        // Start a new chat
        setCurrentChatId(undefined);
        setMessages([]);
        setIsResumingChat(false);
        
        // Clear URL parameters
        setSearchParams({});
        
        // Auto-submit the message after a brief delay to ensure state is updated
        setTimeout(() => {
          handleSendMessage(decodeURIComponent(messageParam));
        }, 100);
        
        processedParamsRef.current = true;
      }
    }
  }, [searchParams, setSearchParams]);

  // Fetch user's chat history on component mount
  useEffect(() => {
    const fetchChats = async () => {
      setIsFetchingChats(true);
      try {
        const userChats = await getUserChats();
        setChats(userChats);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setIsFetchingChats(false);
      }
    };

    fetchChats();
  }, []);

  // Load messages when chat ID changes
  useEffect(() => {
    if (currentChatId) {
      setSearchParams({ id: currentChatId });
      loadChatMessages(currentChatId);
    } else {
      // Clear messages if no chat is selected
      setMessages([]);
      setSearchParams({});
    }
  }, [currentChatId, setSearchParams]);

  const loadChatMessages = async (chatId: string) => {
    setIsFetchingMessages(true);
    setIsResumingChat(true); // Mark that we're resuming a chat
    try {
      const chatMessages = await getChatMessages(chatId);
      
      // Sort messages by timestamp
      const sortedMessages = [...chatMessages].sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateA.getTime() - dateB.getTime();
      });
      
      setMessages(sortedMessages);
      
      // Set the last response ID to the last assistant message to maintain context when resuming a chat
      const assistantMessages = sortedMessages.filter(msg => msg.role === MessageRole.ASSISTANT);
      if (assistantMessages.length > 0) {
        const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
        if (lastAssistantMessage?.responseId) {
          console.log('Chat has previous response ID:', lastAssistantMessage.responseId);
        }
      }
    } catch (error) {
      console.error(`Error loading messages for chat ${chatId}:`, error);
    } finally {
      setIsFetchingMessages(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message to state
    const userMessage: ChatMessage = {
      role: MessageRole.USER,
      content,
      timestamp: new Date(),
      chatId: currentChatId
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('Sending message with context from previous messages');
      
      // Always send previous messages for context (not just when resuming)
      let previousMessagesToSend: ChatMessage[] | undefined;
      if (messages.length > 0) {
        // Calculate estimated token count of messages to ensure we don't exceed limits
        let tokenCount = 0;
        let messagesToInclude = [];
        
        // Start from the most recent messages and work backwards
        for (let i = messages.length - 1; i >= 0; i--) {
          const msg = messages[i];
          const msgTokens = estimateTokenCount(msg.content);
          
          // If adding this message would exceed our token budget, stop
          if (tokenCount + msgTokens > AVAILABLE_INPUT_TOKENS * 0.8) {
            break;
          }
          
          // Otherwise, include this message
          messagesToInclude.unshift(msg);
          tokenCount += msgTokens;
        }
        
        // If we have messages to include, send them
        if (messagesToInclude.length > 0) {
          previousMessagesToSend = messagesToInclude;
          console.log(`Sending ${previousMessagesToSend.length} previous messages (approx. ${tokenCount} tokens) for context`);
        }
        
        // Reset resuming flag after first message
        setIsResumingChat(false);
      }
      
      // Send to API and get response
      const assistantMessage = await sendMessage(
        content, 
        currentChatId, 
        undefined, // No longer using previous_response_id
        previousMessagesToSend
      );
      
      // Update the chat ID if this is a new chat
      if (assistantMessage.chatId && !currentChatId) {
        setCurrentChatId(assistantMessage.chatId);
        
        // Refresh chat list to include the new chat
        const userChats = await getUserChats();
        setChats(userChats);
      }
      
      // Add assistant response to state
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Handle error - add error message
      const errorMessage: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        chatId: currentChatId
      };
      
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error in chat exchange:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleNewChat = () => {
    // Clear current chat state
    setCurrentChatId(undefined);
    setMessages([]);
    setIsResumingChat(false);
  };

  const handleDeleteChat = async (chatId: string) => {
    // Store the chat being deleted for potential rollback
    const chatToDelete = chats.find(chat => chat.chat_id === chatId);
    if (!chatToDelete) return;

    // Optimistically remove from UI immediately
    setChats(prev => prev.filter(chat => chat.chat_id !== chatId));
    setDeletingChatIds(prev => new Set(prev).add(chatId));

    // If this was the current chat, clear it
    if (chatId === currentChatId) {
      handleNewChat();
    }

    try {
      await deleteChat(chatId);
      // Success - remove from deleting set
      setDeletingChatIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
    } catch (error) {
      console.error(`Error deleting chat ${chatId}:`, error);
      
      // Rollback - restore the chat to the list
      setChats(prev => {
        // Insert the chat back in its original position
        const newChats = [...prev];
        const originalIndex = chats.findIndex(chat => chat.chat_id === chatId);
        if (originalIndex !== -1) {
          newChats.splice(originalIndex, 0, chatToDelete);
        } else {
          newChats.unshift(chatToDelete); // Add to beginning if position unknown
        }
        return newChats;
      });

      // Remove from deleting set
      setDeletingChatIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });

      // Show error feedback (you might want to add a toast notification here)
      showToast('Failed to delete chat. Please try again.', 'error');
    }
  };

  // Prune messages if we exceed the token limit for context window
  useEffect(() => {
    if (messages.length < 3) return; // Don't prune if we have fewer than 3 messages
    
    // Calculate estimated token count of current conversation
    const tokenCount = messages.reduce((total, msg) => {
      return total + estimateTokenCount(msg.content);
    }, 0);
    
    // If we're approaching the token limit, prune old messages
    if (tokenCount > AVAILABLE_INPUT_TOKENS) {
      let prunedMessages = [...messages];
      
      // Remove oldest messages until we're under the limit
      while (prunedMessages.length > 2 && 
            prunedMessages.reduce((total, msg) => total + estimateTokenCount(msg.content), 0) > AVAILABLE_INPUT_TOKENS) {
        prunedMessages.shift();
      }
      
      setMessages(prunedMessages);
    }
  }, [messages]);

  return (
    <MainLayout showBackButton onBack={() => navigate('/home')}>
      <div className="flex overflow-hidden bg-black -mx-4 sm:-mx-6 lg:-mx-8 -my-8" style={{ height: 'calc(100vh - 97px)' }}>
        {/* Toast Notifications */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />

        {/* Mobile Chat History Overlay */}
        <div className={`fixed inset-0 z-50 bg-black transform transition-transform duration-300 ease-in-out lg:hidden ${
          showMobileHistory ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tighter text-white">Your Chats</h2>
              <Button
                variant="secondary"
                onClick={() => setShowMobileHistory(false)}
                className="h-12 w-12 !p-0 flex items-center justify-center"
              >
                <XMarkIcon className="w-6 h-6" />
              </Button>
            </div>
            
            {/* Mobile Chat History */}
            <div className="flex-1 p-4 overflow-y-auto">
              <ChatHistory 
                chats={chats}
                currentChatId={currentChatId}
                isLoading={isFetchingChats}
                onSelectChat={(chatId) => {
                  handleSelectChat(chatId);
                  setShowMobileHistory(false);
                }}
                onNewChat={() => {
                  handleNewChat();
                  setShowMobileHistory(false);
                }}
                onDeleteChat={handleDeleteChat}
                showHeader={false}
                deletingChatIds={deletingChatIds}
              />
            </div>
          </div>
        </div>

        {/* Desktop Chat History Sidebar */}
        <div className={`hidden lg:flex flex-shrink-0 border-r border-gray-800 bg-black overflow-hidden flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-16' : 'w-80 xl:w-96'
        }`}>
          {isSidebarCollapsed ? (
            // Collapsed sidebar - just toggle button
            <div className="p-4 flex justify-center">
              <Button
                variant="secondary"
                onClick={toggleSidebar}
                className="h-12 w-12 !p-0 flex items-center justify-center"
                title="Expand Chat History"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </Button>
            </div>
          ) : (
            // Expanded sidebar - full chat history
            <>
              <div className="p-4 lg:p-6 border-b border-gray-800 flex items-center justify-between h-[73px] lg:h-[97px]">
                <h2 className="text-xl font-black tracking-tighter text-white">Your Chats</h2>
                <Button
                  variant="secondary"
                  onClick={toggleSidebar}
                  className="h-10 w-10 !p-0 flex items-center justify-center"
                  title="Collapse Chat History"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 lg:p-6 flex-1 overflow-y-auto">
                <ChatHistory 
                  chats={chats}
                  currentChatId={currentChatId}
                  isLoading={isFetchingChats}
                  onSelectChat={handleSelectChat}
                  onNewChat={handleNewChat}
                  onDeleteChat={handleDeleteChat}
                  showHeader={false}
                  deletingChatIds={deletingChatIds}
                />
              </div>
            </>
          )}
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black">
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-gray-800 bg-black flex-shrink-0 h-[73px] lg:h-[97px]">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-2 lg:gap-4 min-w-0">
                {/* Mobile Menu Button */}
                <Button
                  variant="secondary"
                  onClick={() => setShowMobileHistory(true)}
                  className="lg:hidden h-12 w-12 !p-0 flex items-center justify-center flex-shrink-0"
                  title="Open Chat History"
                >
                  <Bars3Icon className="w-6 h-6" />
                </Button>
                

                
                {/* Title */}
                <h1 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tighter text-white truncate">
                  {currentChatId ? 'Continue Your Conversation' : 'Start a New Chat'}
                </h1>
              </div>
            </div>
          </div>
          
          {/* Chat Content */}
          <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
            {isFetchingMessages ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading messages...</p>
                </div>
              </div>
            ) : (
              <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}; 