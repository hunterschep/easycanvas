import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { Loading } from '@/components/common/Loading';
import { SectionCard } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { useAIPlanner } from '../hooks/useAIPlanner';
import { CalendarDaysIcon, SparklesIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export const AIPlannerPage = () => {
  const { courses, loading: coursesLoading } = useCourses();
  const { generatePlan, isGenerating, planData, error, isSuccess } = useAIPlanner();

  // Auto-generate plan when courses are loaded and we don't have plan data yet
  useEffect(() => {
    console.log('🎯 [AI Planner Page] useEffect triggered with conditions:', {
      coursesLoading,
      coursesCount: courses?.length || 0,
      hasPlanData: !!planData,
      isGenerating,
      hasError: !!error,
      shouldGenerate: !coursesLoading && courses && courses.length > 0 && !planData && !isGenerating && !error
    });

    if (!coursesLoading && courses && courses.length > 0 && !planData && !isGenerating && !error) {
      console.log('🎯 [AI Planner Page] Conditions met! Auto-generating AI plan...');
      console.log('🎯 [AI Planner Page] Course data available:', {
        courseCount: courses.length,
        firstCourseName: courses[0]?.name || 'Unknown',
        totalAssignments: courses.reduce((sum, course) => sum + (course.assignments?.length || 0), 0)
      });
      generatePlan();
    } else {
      console.log('🎯 [AI Planner Page] Conditions not met for auto-generation');
    }
  }, [coursesLoading, courses, planData, isGenerating, error, generatePlan]);

  // Show loading screen while courses are loading or AI is generating
  const isLoading = coursesLoading || isGenerating;
  
  console.log('🎯 [AI Planner Page] Render state:', {
    isLoading,
    coursesLoading, 
    isGenerating,
    hasPlanData: !!planData,
    hasError: !!error,
    isSuccess,
    planDataLength: planData?.todo_list?.length || 0,
    errorMessage: error?.message || 'No error'
  });

  if (isLoading) {
    console.log('🎯 [AI Planner Page] Showing loading screen');
    console.log('🎯 [AI Planner Page] Loading breakdown:', {
      coursesLoading: coursesLoading,
      isGenerating: isGenerating,
      coursesCount: courses?.length || 0
    });
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <CalendarDaysIcon className="w-16 h-16 text-purple-400" />
                <div className="absolute -top-1 -right-1">
                  <SparklesIcon className="w-6 h-6 text-yellow-400 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black glass-text-primary tracking-tighter mb-4">
                AI Planner
              </h1>
              <p className="text-xl sm:text-2xl glass-text-secondary max-w-3xl mx-auto leading-relaxed">
                AI Generated todo list and calendar
              </p>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="space-y-8">
            <SectionCard 
              title="Generating Your Personalized Plan"
              icon={<SparklesIcon className="w-8 h-8 text-purple-400 animate-pulse" />}
              size="lg"
              className="text-center"
            >
              <div className="space-y-6 py-8">
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Main loading spinner */}
                    <div className="w-20 h-20 border-4 border-purple-500/20 rounded-full animate-spin border-t-purple-400"></div>
                    {/* Inner pulse dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold glass-text-primary">
                    Analyzing Your Course Data
                  </h3>
                  
                  <div className="space-y-3">
                    <LoadingStep 
                      icon={<ClockIcon className="w-5 h-5" />}
                      text="Processing assignments and due dates"
                      completed={coursesLoading === false}
                    />
                    <LoadingStep 
                      icon={<CalendarDaysIcon className="w-5 h-5" />}
                      text="Generating intelligent scheduling"
                      completed={coursesLoading === false && isGenerating}
                    />
                    <LoadingStep 
                      icon={<SparklesIcon className="w-5 h-5" />}
                      text="Creating personalized todo list"
                      completed={false}
                    />
                  </div>
                  
                  <p className="glass-text-secondary text-lg mt-6">
                    {isGenerating 
                      ? "AI is analyzing your coursework and generating your personalized plan... This typically takes 1-2 minutes."
                      : "This may take a moment as we create your perfect academic plan..."
                    }
                  </p>
                  
                  {isGenerating && (
                    <div className="mt-4 p-4 glass-chip bg-[rgba(59,130,246,0.06)] border border-blue-500/20 rounded-xl">
                      <p className="text-sm text-blue-300 font-medium">
                        ⏳ Please keep this tab open - AI generation can take 1-2 minutes for comprehensive planning
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle error state
  if (error && !isLoading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <CalendarDaysIcon className="w-16 h-16 text-red-400" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black glass-text-primary tracking-tighter mb-4">
                AI Planner
              </h1>
              <p className="text-xl text-red-400 max-w-3xl mx-auto leading-relaxed">
                Failed to generate your plan. Please try again.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <Button
              onClick={generatePlan}
              variant="primary"
              size="lg"
              leftIcon={<ArrowPathIcon className="w-5 h-5" />}
              disabled={isGenerating}
            >
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Render the AI-generated todo list
  if (planData) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <CalendarDaysIcon className="w-16 h-16 text-purple-400" />
                <div className="absolute -top-1 -right-1">
                  <SparklesIcon className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black glass-text-primary tracking-tighter mb-4">
                Your AI Study Plan
              </h1>
              <p className="text-xl sm:text-2xl glass-text-secondary max-w-3xl mx-auto leading-relaxed">
                Personalized todo list based on {planData.course_count} courses and {planData.assignment_count} assignments
              </p>
            </div>

            {/* Regenerate Button */}
            <div className="flex justify-center">
              <Button
                onClick={generatePlan}
                variant="secondary"
                size="sm"
                leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                disabled={isGenerating}
                className="flex-shrink-0"
              >
                {isGenerating ? 'Regenerating...' : 'Generate New Plan'}
              </Button>
            </div>
          </div>

          {/* AI-Generated Content */}
          <div className="space-y-8">
            <SectionCard 
              title="Your Personalized Academic Plan"
              icon={<SparklesIcon className="w-8 h-8 text-purple-400" />}
              size="lg"
              className="overflow-hidden"
            >
              <div className="space-y-6 -mt-2 sm:-mt-4">
                {/* Generated timestamp */}
                <div className="text-sm glass-text-secondary text-center pb-4 border-b border-white/10">
                  Generated on {new Date(planData.generated_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>

                {/* Markdown content with custom styling */}
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                  <div className="ai-planner-content">
                    <ReactMarkdown
                      components={{
                        h1: ({children}) => <h1 className="text-2xl sm:text-3xl font-bold glass-text-primary mb-4 flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-purple-400" />{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl sm:text-2xl font-bold glass-text-primary mb-3 mt-8 flex items-center gap-2"><CalendarDaysIcon className="w-5 h-5 text-blue-400" />{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-bold glass-text-primary mb-2 mt-6">{children}</h3>,
                        h4: ({children}) => <h4 className="text-base font-bold glass-text-primary mb-2 mt-4">{children}</h4>,
                        p: ({children}) => <p className="glass-text-secondary mb-3 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="space-y-2 mb-4">{children}</ul>,
                        ol: ({children}) => <ol className="space-y-2 mb-4 list-decimal">{children}</ol>,
                        li: ({children}) => (
                          <li className="glass-text-secondary flex items-start gap-2">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{children}</span>
                          </li>
                        ),
                        strong: ({children}) => <strong className="glass-text-primary font-semibold">{children}</strong>,
                        em: ({children}) => <em className="text-blue-300">{children}</em>,
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-purple-400 pl-4 py-2 glass-chip bg-[rgba(147,51,234,0.06)] my-4">
                            <div className="glass-text-secondary">{children}</div>
                          </blockquote>
                        ),
                        code: ({children}) => (
                          <code className="bg-gray-800 text-green-300 px-2 py-1 rounded text-sm">{children}</code>
                        ),
                        hr: () => <hr className="border-white/20 my-8" />
                      }}
                    >
                      {planData.todo_list}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Footer with action buttons */}
                <div className="pt-6 border-t border-white/10 text-center space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={generatePlan}
                      variant="primary"
                      leftIcon={<SparklesIcon className="w-4 h-4" />}
                      disabled={isGenerating}
                    >
                      Generate New Plan
                    </Button>
                  </div>
                  <p className="text-sm glass-text-secondary">
                    💡 Tip: Your plan updates automatically as your courses and assignments change
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Fallback for empty state
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-4xl font-black glass-text-primary tracking-tighter mb-4">
              AI Planner
            </h1>
            <p className="text-xl glass-text-secondary">
              Generate your personalized study plan
            </p>
          </div>
          <Button
            onClick={generatePlan}
            variant="primary"
            size="lg"
            leftIcon={<SparklesIcon className="w-5 h-5" />}
            disabled={isGenerating}
          >
            Generate Plan
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

// Helper component for loading steps
interface LoadingStepProps {
  icon: React.ReactNode;
  text: string;
  completed: boolean;
}

const LoadingStep = ({ icon, text, completed }: LoadingStepProps) => {
  return (
    <div className="flex items-center justify-center gap-3 p-4 glass-chip">
      <div className={`flex-shrink-0 ${completed ? 'text-green-400' : 'text-purple-400'}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${completed ? 'glass-text-primary' : 'glass-text-secondary'}`}>
        {text}
      </span>
      {completed && (
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};
