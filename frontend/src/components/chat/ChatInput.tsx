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
      <div className="flex items-stretch gap-3 sm:gap-4">
        {/* Enhanced textarea with glassmorphism */}
        <div className="flex-1 relative group">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "AI is responding..." : "Type your message here..."}
            className={`w-full py-3 sm:py-4 px-4 sm:px-5 glass-text-primary glass-chip resize-none focus:outline-none focus:ring-2 transition-all h-[48px] sm:h-[56px] text-sm sm:text-base font-medium ${
              isLoading 
                ? 'placeholder-white/40 cursor-not-allowed opacity-60' 
                : 'focus:ring-white/20 placeholder-white/50 focus:bg-[rgba(17,25,40,0.28)]'
            }`}
            rows={1}
            disabled={isLoading}
          />
        </div>
        
        {/* Enhanced send button with glass effect */}
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          variant="primary"
          size="md"
          isLoading={isLoading}
          leftIcon={!isLoading ? <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : undefined}
          className="flex-shrink-0 h-[48px] sm:h-[56px] px-4 sm:px-6 font-semibold"
        >
          {isLoading ? (
            <span className="hidden sm:inline">Generating...</span>
          ) : (
            <span className="hidden sm:inline">Send</span>
          )}
        </Button>
      </div>
      
      {/* Subtle helper text */}
      <div className="mt-2 sm:mt-3 text-xs glass-text-secondary flex items-center justify-between">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {message.length > 0 && (
          <span className={`${message.length > 1000 ? 'text-yellow-500' : 'glass-text-secondary'}`}>
            {message.length}/2000
          </span>
        )}
      </div>
    </form>
  );
};

export default ChatInput; 