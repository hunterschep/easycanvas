import { ChatMessage, MessageRole } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <div className="space-y-6">
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`flex ${message.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === MessageRole.USER ? (
            // User message
            <div className="max-w-[80%]">
              <div className="bg-black border border-blue-500/30 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-white leading-relaxed">
                  {message.content}
                </div>
              </div>
            </div>
          ) : (
            // Assistant message
            <div className="max-w-[85%]">
              <div className="bg-black border border-gray-800 rounded-lg p-4">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Paragraphs
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0 text-white leading-relaxed">
                        {children}
                      </p>
                    ),
                    // Headings
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold mb-3 text-white">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold mb-3 text-white">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-bold mb-2 text-white">
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
                      <ul className="list-disc list-inside mb-3 space-y-1 text-white ml-4">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-3 space-y-1 text-white ml-4">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-white leading-relaxed">
                        {children}
                      </li>
                    ),
                    // Code
                    code: ({ node, inline, children, ...props }) => {
                      return inline ? (
                        <code className="bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-300 border border-gray-700" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-gray-900 border border-gray-700 rounded-md p-4 overflow-x-auto mb-3">
                          <code className="text-sm text-gray-300 font-mono" {...props}>
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
                        className="text-blue-400 hover:text-blue-300 underline transition-colors"
                      >
                        {children}
                      </a>
                    ),
                    // Blockquotes
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300 mb-3 bg-gray-900 py-2 rounded-r border border-gray-800">
                        {children}
                      </blockquote>
                    ),
                    // Horizontal rule
                    hr: () => (
                      <hr className="border-gray-700 my-4" />
                    ),
                    // Tables
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-3">
                        <table className="min-w-full border-collapse border border-gray-700 rounded">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-700 px-3 py-2 bg-gray-800 font-semibold text-left text-white">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-700 px-3 py-2 text-gray-300">
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
    </div>
  );
};

export default MessageList; 