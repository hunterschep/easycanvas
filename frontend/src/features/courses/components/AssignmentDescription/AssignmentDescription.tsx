import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useState } from 'react';

interface AssignmentDescriptionProps {
  description: string | null;
  initialSummary?: string | null;
}

export const AssignmentDescription = ({ description, initialSummary }: AssignmentDescriptionProps) => {
  const [showSummary, setShowSummary] = useState(!!initialSummary);
  const sanitizedDescription = DOMPurify.sanitize(description || '', {
    FORBID_TAGS: ['img', 'iframe', 'video', 'audio'],
    FORBID_ATTR: ['src', 'srcset']
  });

  // For debugging
  console.log('Initial Summary:', initialSummary);

  return (
    <div className="pt-4 border-t border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          {initialSummary ? (showSummary ? 'AI Summary' : 'Original Description') : 'Description'}
        </h2>
        {initialSummary && (
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-400 hover:text-purple-300 border border-purple-900 hover:border-purple-700 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Switch to {showSummary ? 'Original' : 'AI Summary'}
          </button>
        )}
      </div>

      {description ? (
        <div className="prose prose-invert max-w-none">
          {initialSummary && showSummary ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-8 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-400 mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 text-gray-400 mb-4 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 text-gray-400 mb-4 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="text-gray-400" {...props} />,
                code: ({node, inline, className, children, ...props}: any) => 
                  inline ? 
                    <code className="text-purple-300 bg-gray-800/50 px-1.5 py-0.5 rounded-md" {...props}>{children}</code> :
                    <code className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4" {...props}>{children}</code>
              }}
            >
              {initialSummary}
            </ReactMarkdown>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>No description provided for this assignment</span>
        </div>
      )}
    </div>
  );
};