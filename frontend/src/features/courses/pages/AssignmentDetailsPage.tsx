import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { Loading } from '@/components/common/Loading';
import { useAssignmentData } from '../hooks/useAssignmentData';
import { useState } from 'react';
import { Tooltip } from '@/components/common/Tooltip';
import { AssignmentDescription } from '../components/AssignmentDescription/AssignmentDescription';
import { aiService } from '@/features/ai/services/ai.service';
import { logInfo, logError } from '@/utils/debug';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export const AssignmentDetailsPage = () => {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { assignment, loading, error } = useAssignmentData(courseId, assignmentId);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  // Scroll to top when component mounts
  useScrollToTop();

  if (loading) {
    return <Loading message="Loading assignment details..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm bg-gray-800 text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-8 text-center">
        <div className="text-yellow-500 text-xl mb-4">Assignment not found</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm bg-gray-800 text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-black">
        {/* Header Bar */}
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-all duration-200"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                {assignment.html_url && (
                  <a
                    href={assignment.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in Canvas
                  </a>
                )}
                <Tooltip content="Will summarize assignment description and propose next steps with AI">
                  <button
                    onClick={async () => {
                      if (!assignment.description) return;
                      setIsSummarizing(true);
                      try {
                        const result = await aiService.summarizeText(assignment.description);
                        if (result) {
                          setSummary(result);
                        }
                      } catch (error) {
                        logError('Failed to summarize text', error);
                      } finally {
                        setIsSummarizing(false);
                      }
                    }}
                    disabled={!assignment.description || isSummarizing}
                    className={`px-4 py-2 text-sm border rounded-lg transition-all duration-200 flex items-center gap-2
                      ${!assignment.description 
                        ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border-gray-800'
                        : 'text-purple-400 hover:text-purple-300 border-purple-900 hover:border-purple-700'
                      }
                    `}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {isSummarizing ? 'Working...' : 'Get Help with AI'}
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-black border border-gray-800 rounded-lg p-6 space-y-6">
              {/* Assignment Header */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">{assignment.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  {assignment.points_possible > 0 && (
                    <span className="px-2 py-1 rounded-full border border-gray-800">
                      {assignment.points_possible} points
                    </span>
                  )}
                  {assignment.grade && assignment.grade !== 'N/A' && (
                    <span className="px-2 py-1 rounded-full border border-gray-800 text-green-400">
                      Grade: {assignment.grade}/{assignment.points_possible}
                    </span>
                  )}
                </div>
              </div>

              {/* Assignment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white">Details</h2>
                  <div className="space-y-2">
                    {assignment.due_at && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Due: {new Date(assignment.due_at).toLocaleString()}</span>
                      </div>
                    )}
                    {assignment.lock_at && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Locks: {new Date(assignment.lock_at).toLocaleString()}</span>
                      </div>
                    )}
                    {assignment.submission_types && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Submission Type: {assignment.submission_types.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Assignment Description */}
              <AssignmentDescription 
                description={assignment.description} 
                initialSummary={summary}
              />
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}; 