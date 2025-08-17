import { ChatMessage, MessageRole } from '@/types/chat';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

// Typing indicator component
const TypingIndicator = () => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300" />
      <div className="relative flex items-center space-x-3 p-4 sm:p-5 bg-gray-900/60 rounded-xl border border-gray-800/80 backdrop-blur-sm">
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
        <span className="text-gray-300 text-sm font-medium">AI is thinking...</span>
      </div>
    </div>
  );
};

const MessageList = ({ messages, isLoading = false }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 via-gray-500/20 to-gray-600/20 rounded-full blur-xl opacity-50"></div>
            <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-700/50">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-gray-300 text-lg font-medium mb-2">Ready to assist you</p>
            <p className="text-gray-500 text-sm leading-relaxed">Start a conversation by typing your question or request below. I'm here to help with your courses and assignments.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`flex ${message.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === MessageRole.USER ? (
            // User message - enhanced styling
            <div className="max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] xl:max-w-[70%]">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-500/20 rounded-xl blur opacity-50 group-hover:opacity-70 transition duration-300" />
                <div className="relative bg-gradient-to-r from-gray-950 via-black to-gray-950 border border-blue-500/40 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
                  <div className="whitespace-pre-wrap text-white leading-relaxed text-sm sm:text-base font-medium">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Assistant message - enhanced styling
            <div className="max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%]">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600/20 via-gray-500/20 to-gray-600/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                <div className="relative bg-gradient-to-r from-gray-950/80 via-black to-gray-950/80 border border-gray-700/60 rounded-xl p-4 sm:p-5 lg:p-6 backdrop-blur-sm">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Paragraphs
                    p: ({ children }) => (
                      <p className="mb-4 sm:mb-5 last:mb-0 text-gray-100 leading-relaxed text-sm sm:text-base font-normal">
                        {children}
                      </p>
                    ),
                    // Headings
                    h1: ({ children }) => (
                      <h1 className="text-xl sm:text-2xl font-black mb-4 sm:mb-5 mt-3 text-white tracking-tight">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 mt-5 text-white tracking-tight">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 mt-4 text-white tracking-tight">
                        {children}
                      </h3>
                    ),
                    // Strong/Bold
                    strong: ({ children }) => (
                      <strong className="font-bold text-white">
                        {children}
                      </strong>
                    ),
                    // Emphasis/Italic
                    em: ({ children }) => (
                      <em className="italic text-gray-300">
                        {children}
                      </em>
                    ),
                    // Lists
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-3 sm:mb-4 space-y-2 text-white ml-2 sm:ml-4 text-sm sm:text-base">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-3 sm:mb-4 space-y-2 text-white ml-2 sm:ml-4 text-sm sm:text-base">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-white leading-relaxed py-0.5">
                        {children}
                      </li>
                    ),
                    // Code
                    code: ({ node, inline, children, ...props }) => {
                      return inline ? (
                        <code className="bg-gray-800/80 px-2 py-1 rounded-md text-xs sm:text-sm font-mono text-gray-200 border border-gray-700/50 backdrop-blur-sm" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-3 sm:p-4 lg:p-5 overflow-x-auto mb-4 sm:mb-5 backdrop-blur-sm">
                          <code className="text-xs sm:text-sm text-gray-200 font-mono leading-relaxed" {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    // Links
                    a: ({ children, href }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline transition-colors break-words"
                      >
                        {children}
                      </a>
                    ),
                    // Blockquotes
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500/60 pl-4 sm:pl-6 italic text-gray-200 mb-4 sm:mb-5 bg-gray-900/60 py-4 sm:py-5 rounded-r-lg border-r border-t border-b border-gray-700/40 backdrop-blur-sm">
                        {children}
                      </blockquote>
                    ),
                    // Horizontal rule
                    hr: () => (
                      <hr className="border-gray-700 my-3 sm:my-4" />
                    ),
                    // Tables
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-2 sm:mb-3">
                        <table className="min-w-full border-collapse border border-gray-700 rounded text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-700 px-2 sm:px-3 py-1 sm:py-2 bg-gray-800 font-semibold text-left text-white text-xs sm:text-sm">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-700 px-2 sm:px-3 py-1 sm:py-2 text-gray-300 text-xs sm:text-sm">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[90%] sm:max-w-[85%] lg:max-w-[80%]">
            <TypingIndicator />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList; 