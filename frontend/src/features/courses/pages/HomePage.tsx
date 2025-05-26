import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { Loading } from '@/components/common/Loading';
import { useCourses } from '../hooks/useCourses';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatHistory from '@/features/chat/components/ChatHistory';
import { ChatMessage, MessageRole, ChatListItem } from '@/types/chat';
import { sendMessage, getUserChats, getChatMessages, createChat, deleteChat } from '@/services/chatService';
import { estimateTokenCount, AVAILABLE_INPUT_TOKENS } from '@/utils/tokenCounter';

// With 8k token limit, this allows for roughly 40 messages
// Assuming average message length of ~200 tokens
const MAX_CONTEXT_MESSAGES = 40;

export const HomePage = () => {
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(() => searchParams.get('chat') || undefined);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isFetchingChats, setIsFetchingChats] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isResumingChat, setIsResumingChat] = useState(false);

  // Get all assignments across all courses
  const allAssignments = courses.flatMap(course => course.assignments);
  // Get all announcements across all courses
  const allAnnouncements = courses.flatMap(course => course.announcements);
  // Get all modules and module items 
  const allModules = courses.flatMap(course => course.modules);
  const totalModuleItems = courses.flatMap(course => 
    course.modules.flatMap(module => module.items)
  ).length;

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
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('chat', currentChatId);
        return newParams;
      });
      loadChatMessages(currentChatId);
    } else {
      // Clear messages if no chat is selected
      setMessages([]);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('chat');
        return newParams;
      });
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
    try {
      await deleteChat(chatId);
      
      // Remove from local state
      setChats(prev => prev.filter(chat => chat.chat_id !== chatId));
      
      // If this was the current chat, clear it
      if (chatId === currentChatId) {
        handleNewChat();
      }
    } catch (error) {
      console.error(`Error deleting chat ${chatId}:`, error);
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

  if (coursesLoading) {
    return <Loading message="Fetching your courses... This may take a few minutes!" />;
  }

  if (coursesError) {
    return <div className="text-red-500">{coursesError}</div>;
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to EasyCanvas</h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-4">
            Your courses and assignments are successfully loaded.
            There are {courses.length} courses with a total of {allAssignments.length} assignments and {allAnnouncements.length} announcements. 
            There are {allModules.length} modules with a total of {totalModuleItems} module items.
          </p>
        </div>
        
        {/* Chat Section */}
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">AI Chat Assistant</h2>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex h-[600px]">
              {/* Chat History Sidebar */}
              <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
                <ChatHistory 
                  chats={chats}
                  currentChatId={currentChatId}
                  isLoading={isFetchingChats}
                  onSelectChat={handleSelectChat}
                  onNewChat={handleNewChat}
                  onDeleteChat={handleDeleteChat}
                />
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto">
                  {isFetchingMessages ? (
                    <div className="flex justify-center items-center h-64">
                      <p>Loading messages...</p>
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
}; 