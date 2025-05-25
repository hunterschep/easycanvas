import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import ChatWindow from '@/components/chat/ChatWindow';
import { ChatMessage, MessageRole } from '@/types/chat';
import { sendMessage } from '@/services/chatService';
import { estimateTokenCount, AVAILABLE_INPUT_TOKENS } from '@/utils/tokenCounter';

export const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponseId, setLastResponseId] = useState<string | undefined>(undefined);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message to state
    const userMessage: ChatMessage = {
      role: MessageRole.USER,
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send to API and get response, including the last response ID for context
      const assistantMessage = await sendMessage(content, lastResponseId);
      
      // Update the last response ID for the next message
      if (assistantMessage.responseId) {
        setLastResponseId(assistantMessage.responseId);
      }
      
      // Add assistant response to state
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Handle error - add error message
      const errorMessage: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error in chat exchange:', error);
    } finally {
      setIsLoading(false);
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
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Assistant</h1>
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
}; 