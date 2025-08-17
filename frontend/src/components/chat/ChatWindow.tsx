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
      {/* Gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
      
      {/* Main chat container */}
      <div className="relative flex flex-col h-full bg-black border border-gray-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
        {/* Messages container with custom scrollbar */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600">
          <div className="p-4 sm:p-6 lg:p-8">
            <MessageList messages={messages} isLoading={isLoading} />
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input area with subtle separation */}
        <div className="border-t border-gray-800/60 bg-gradient-to-r from-black via-gray-950 to-black flex-shrink-0">
          <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 