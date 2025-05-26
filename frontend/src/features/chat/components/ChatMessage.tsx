import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import DOMPurify from 'dompurify';
import { ChatMessage as ChatMessageType, MessageRole, MessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Function to determine message styling based on role
  const getMessageStyles = () => {
    if (message.role === MessageRole.USER) {
      return 'bg-blue-50 border-blue-200';
    }
    return 'bg-white border-gray-200';
  };

  // Function to render function call content
  const renderFunctionCall = () => {
    try {
      const args = message.arguments ? JSON.parse(message.arguments) : {};
      
      return (
        <div className="text-xs">
          <div className="mb-1 text-gray-500">Looking up Canvas data:</div>
          <div className="font-mono bg-gray-100 p-2 rounded overflow-auto">
            <div className="font-semibold text-blue-600">{message.name}(</div>
            <div className="pl-4">
              {Object.entries(args).map(([key, value]) => (
                <div key={key}>
                  <span className="text-purple-600">{key}</span>: 
                  <span className="text-green-600"> {JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
            <div className="text-blue-600">)</div>
          </div>
        </div>
      );
    } catch (e) {
      return <div>Error displaying function call</div>;
    }
  };

  // Function to render function call output
  const renderFunctionOutput = () => {
    try {
      const output = message.output ? JSON.parse(message.output) : {};
      
      return (
        <div className="text-xs">
          <div className="mb-1 text-gray-500">Canvas data retrieved:</div>
          <div className="font-mono bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(output, null, 2)}
          </div>
        </div>
      );
    } catch (e) {
      return <div>Error displaying function output</div>;
    }
  };

  // Render based on message type
  const renderContent = () => {
    // Handle function call messages
    if (message.type === MessageType.FUNCTION_CALL) {
      return renderFunctionCall();
    }
    
    // Handle function call output messages
    if (message.type === MessageType.FUNCTION_CALL_OUTPUT) {
      return renderFunctionOutput();
    }
    
    // For regular text messages, render the content with markdown
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
        >
          {DOMPurify.sanitize(message.content)}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`p-4 rounded-lg border ${getMessageStyles()} mb-4`}>
      <div className="flex justify-between mb-2">
        <div className="font-medium text-sm">
          {message.role === MessageRole.USER ? 'You' : 'EasyCanvas Assistant'}
        </div>
        <div className="text-xs text-gray-500">
          {message.timestamp instanceof Date 
            ? message.timestamp.toLocaleTimeString() 
            : new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default ChatMessage; 