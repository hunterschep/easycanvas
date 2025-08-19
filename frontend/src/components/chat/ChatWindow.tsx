import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/chat';
import ChatInput from './ChatInput';
import MessageList from './MessageList';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatWindow = ({ messages, onSendMessage, isLoading }: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="relative group h-full">
      {/* Very subtle glow effect to match sidebar */}
      <div 
        className="absolute -inset-0.5 bg-gradient-to-r from-gray-600/20 via-gray-500/20 to-gray-600/20 rounded-[var(--radius-lg)] blur opacity-0 group-hover:opacity-30 transition duration-300"
      />
      
      {/* Main chat container with subtle glassmorphism like sidebar */}
      <div className="relative flex flex-col h-full glass-chip overflow-hidden">
        {/* Messages container with custom scrollbar */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
          <div className="p-4 sm:p-6 lg:p-8">
            <MessageList messages={messages} isLoading={isLoading} />
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input area with subtle separation */}
        <div className="border-t border-white/10 bg-[rgba(17,25,40,0.06)] flex-shrink-0 rounded-none rounded-b-[var(--radius-chip)]">
          <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 