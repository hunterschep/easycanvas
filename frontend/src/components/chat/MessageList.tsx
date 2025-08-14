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
    <div className="flex items-center space-x-2 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-gray-400 text-sm">AI is thinking...</span>
    </div>
  );
};

const MessageList = ({ messages, isLoading = false }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Start a conversation by typing below</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`flex ${message.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === MessageRole.USER ? (
            // User message
            <div className="max-w-[85%] sm:max-w-[80%] lg:max-w-[75%]">
              <div className="bg-black border border-blue-500/30 rounded-lg p-3 sm:p-4">
                <div className="whitespace-pre-wrap text-white leading-relaxed text-sm sm:text-base">
                  {message.content}
                </div>
              </div>
            </div>
          ) : (
            // Assistant message
            <div className="max-w-[90%] sm:max-w-[85%] lg:max-w-[80%]">
              <div className="bg-black border border-gray-800 rounded-lg p-3 sm:p-4">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Paragraphs
                    p: ({ children }) => (
                      <p className="mb-3 sm:mb-4 last:mb-0 text-white leading-relaxed text-sm sm:text-base">
                        {children}
                      </p>
                    ),
                    // Headings
                    h1: ({ children }) => (
                      <h1 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 mt-2 text-white tracking-tight">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 mt-4 text-white tracking-tight">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 mt-3 text-white tracking-tight">
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
                        <code className="bg-gray-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono text-gray-300 border border-gray-700" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-gray-900 border border-gray-700 rounded-md p-2 sm:p-3 lg:p-4 overflow-x-auto mb-2 sm:mb-3">
                          <code className="text-xs sm:text-sm text-gray-300 font-mono" {...props}>
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
                      <blockquote className="border-l-4 border-blue-500 pl-4 sm:pl-6 italic text-gray-200 mb-3 sm:mb-4 bg-gray-900/50 py-3 sm:py-4 rounded-r border border-gray-700/50 backdrop-blur-sm">
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