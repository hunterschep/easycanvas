import { ChatMessage, MessageRole } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface MessageListProps {
  messages: ChatMessage[];
}

const MessageList = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Start a conversation by typing below</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`flex ${message.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[80%] p-3 rounded-lg ${
              message.role === MessageRole.USER 
                ? 'bg-gray-800 text-white rounded-tr-none' 
                : 'bg-gray-700 text-white rounded-tl-none'
            }`}
          >
            {message.role === MessageRole.USER ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    // Custom styling for code blocks
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline ? (
                        <pre className="bg-gray-800 rounded-md p-3 overflow-x-auto">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-gray-600 px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Custom styling for tables
                    table: ({ children }) => (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-600">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-600 px-3 py-2 bg-gray-600 font-semibold text-left">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-600 px-3 py-2">
                        {children}
                      </td>
                    ),
                    // Custom styling for links
                    a: ({ children, href }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {children}
                      </a>
                    ),
                    // Custom styling for blockquotes
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-500 pl-4 italic text-gray-300">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList; 