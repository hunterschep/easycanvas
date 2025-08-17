import { useState, FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/common/Button/Button';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 lg:p-6">
      <div className="flex items-end gap-3 sm:gap-4">
        {/* Enhanced textarea with better styling */}
        <div className="flex-1 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600/20 via-gray-500/20 to-gray-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "AI is responding..." : "Type your message here..."}
            className={`relative w-full py-3 sm:py-4 px-4 sm:px-5 text-white bg-gray-950/80 border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all min-h-[48px] sm:min-h-[56px] max-h-32 text-sm sm:text-base font-medium backdrop-blur-sm ${
              isLoading 
                ? 'border-gray-700/60 placeholder-gray-500 cursor-not-allowed' 
                : 'border-gray-700/80 focus:border-gray-600 focus:ring-gray-600/30 placeholder-gray-400 hover:border-gray-600/80'
            }`}
            rows={1}
            disabled={isLoading}
          />
        </div>
        
        {/* Enhanced send button */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 via-blue-400/30 to-blue-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
          <Button
            type="submit"
            disabled={!message.trim() || isLoading}
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={!isLoading ? <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : undefined}
            className="relative flex-shrink-0 h-[48px] sm:h-[56px] px-4 sm:px-6 font-semibold backdrop-blur-sm"
          >
            {isLoading ? (
              <span className="hidden sm:inline">Generating...</span>
            ) : (
              <span className="hidden sm:inline">Send</span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Subtle helper text */}
      <div className="mt-2 sm:mt-3 text-xs text-gray-500 flex items-center justify-between">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {message.length > 0 && (
          <span className={`${message.length > 1000 ? 'text-yellow-500' : 'text-gray-500'}`}>
            {message.length}/2000
          </span>
        )}
      </div>
    </form>
  );
};

export default ChatInput; 