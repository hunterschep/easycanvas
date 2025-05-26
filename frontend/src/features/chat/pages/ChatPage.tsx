import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatHistory from '../components/ChatHistory';
import { ChatMessage, MessageRole, ChatListItem } from '@/types/chat';
import { sendMessage, getUserChats, getChatMessages, createChat, deleteChat } from '@/services/chatService';
import { estimateTokenCount, AVAILABLE_INPUT_TOKENS } from '@/utils/tokenCounter';

// With 8k token limit, this allows for roughly 40 messages
// Assuming average message length of ~200 tokens
const MAX_CONTEXT_MESSAGES = 40;

export const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(() => searchParams.get('id') || undefined);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isFetchingChats, setIsFetchingChats] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isResumingChat, setIsResumingChat] = useState(false);

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
      }
      
      // Send to API and get response (no longer using lastResponseId)
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

  return (
    <MainLayout>
      <div className="flex h-full w-full">
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
            <h1 className="text-2xl font-bold mb-6 text-center">
              {currentChatId ? 'Continue Your Conversation' : 'Start a New Chat'}
            </h1>
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
    </MainLayout>
  );
}; 