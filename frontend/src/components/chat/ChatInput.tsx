import { useState, FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/common/Button/Button';

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
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6">
      <div className="flex items-end gap-2 sm:gap-3 lg:gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="flex-1 py-2 sm:py-3 px-3 sm:px-4 text-white bg-transparent border border-gray-800 rounded-lg resize-none focus:outline-none focus:border-white focus:ring-1 focus:ring-white placeholder-gray-600 transition-all min-h-[40px] sm:min-h-[48px] max-h-32 text-sm sm:text-base"
          rows={1}
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          isLoading={isLoading}
          variant="primary"
          className="flex-shrink-0 h-[40px] sm:h-[48px] px-4 sm:px-6 text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Send</span>
          <span className="sm:hidden">→</span>
        </Button>
      </div>
    </form>
  );
};

export default ChatInput; 