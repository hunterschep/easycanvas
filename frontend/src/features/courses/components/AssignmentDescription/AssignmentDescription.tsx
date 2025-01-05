import { useState } from 'react';
import { useAISummary } from '@/features/ai/hooks/useAISummary';
import DOMPurify from 'dompurify';

interface AssignmentDescriptionProps {
  description: string | null;
  initialSummary?: string | null;
}

export const AssignmentDescription = ({ description, initialSummary }: AssignmentDescriptionProps) => {
  const [summary, setSummary] = useState<string | null>(initialSummary || null);
  const { summarize, loading: isSummarizing, error } = useAISummary();

  const sanitizedDescription = DOMPurify.sanitize(description || '', {
    FORBID_TAGS: ['img', 'iframe', 'video', 'audio'],
    FORBID_ATTR: ['src', 'srcset']
  });

  const handleSummarize = async () => {
    if (!description) return;
    const result = await summarize(description);
    if (result) {
      setSummary(result);
    }
  };

  return (
    <div className="pt-4 border-t border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          {summary ? 'AI Summary' : 'Description'}
        </h2>
        {description && (
          <button
            onClick={summary ? () => setSummary(null) : handleSummarize}
            className="text-sm text-gray-400 hover:text-white"
          >
            {summary ? 'View Original' : 'View AI Summary'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {isSummarizing ? (
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Generating summary...</span>
        </div>
      ) : description ? (
        <div 
          className="prose prose-invert max-w-none text-gray-400"
          dangerouslySetInnerHTML={{ __html: summary || sanitizedDescription }}
        />
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