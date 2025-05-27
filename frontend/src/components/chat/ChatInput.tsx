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
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-end gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="flex-1 py-3 px-4 text-white bg-transparent border border-gray-800 rounded-lg resize-none focus:outline-none focus:border-white focus:ring-1 focus:ring-white placeholder-gray-600 transition-all min-h-[48px] max-h-32"
          rows={1}
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          isLoading={isLoading}
          variant="primary"
          className="flex-shrink-0 h-[48px] px-6"
        >
          Send
        </Button>
      </div>
    </form>
  );
};

export default ChatInput; 