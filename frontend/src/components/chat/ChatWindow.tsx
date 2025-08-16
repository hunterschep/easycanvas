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
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      <div className="relative flex flex-col h-full bg-black border border-gray-800 rounded-xl overflow-hidden">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 min-h-0">
          <MessageList messages={messages} isLoading={isLoading} />
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="border-t border-gray-800 bg-black flex-shrink-0">
          <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 