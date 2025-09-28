import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { Loading } from '@/components/common/Loading';
import { SectionCard } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { useAIPlanner } from '../hooks/useAIPlanner';
import { CalendarDaysIcon, SparklesIcon, ClockIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, BookOpenIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TodoCard } from '../components/TodoCard';
import { DeadlineCard } from '../components/DeadlineCard';
import { StudyBlockCard } from '../components/StudyBlockCard';
import { InsightCard } from '../components/InsightCard';
import type { TodoItem } from '../services/ai-planner.service';

export const AIPlannerPage = () => {
  const navigate = useNavigate();
  const { courses, loading: coursesLoading } = useCourses();
  const { generatePlan, isGenerating, planData, error, isSuccess } = useAIPlanner();
  
  // Local state for todo completion
  const [completedTodos, setCompletedTodos] = useState<Set<string>>(new Set());

  const handleTodoToggle = (todoId: string) => {
    setCompletedTodos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(todoId)) {
        newSet.delete(todoId);
      } else {
        newSet.add(todoId);
      }
      return newSet;
    });
  };

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
    planDataTodosLength: planData?.todos?.length || 0,
    planDataDeadlinesLength: planData?.deadlines?.length || 0,
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
      <MainLayout showBackButton onBack={() => navigate('/home')}>
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
      <MainLayout showBackButton onBack={() => navigate('/home')}>
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

  // Render the structured AI plan
  if (planData) {
    return (
      <MainLayout showBackButton onBack={() => navigate('/home')}>
        <div className="max-w-7xl mx-auto space-y-8">
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
                Personalized plan based on {planData.course_count} courses and {planData.assignment_count} assignments
              </p>
            </div>

            {/* Summary Stats */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="glass-chip px-4 py-2 text-sm">
                <span className="text-purple-400 font-bold">{planData.summary.totalTasks}</span> tasks
              </div>
              <div className="glass-chip px-4 py-2 text-sm">
                <span className="text-red-400 font-bold">{planData.summary.highPriorityCount}</span> high priority
              </div>
              <div className="glass-chip px-4 py-2 text-sm">
                <span className="text-orange-400 font-bold">{planData.summary.upcomingDeadlines}</span> deadlines
              </div>
              <div className="glass-chip px-4 py-2 text-sm">
                <span className="text-blue-400 font-bold">{planData.summary.estimatedStudyTime}</span> study time
              </div>
            </div>

            {/* Regenerate Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => generatePlan(true)} // Force regenerate
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

          {/* AI-Generated Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Todos and Deadlines */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Todo List */}
              {planData.todos && planData.todos.length > 0 && (
                <SectionCard 
                  title="Todo List"
                  icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />}
                  size="md"
                >
                  <div className="space-y-4">
                    {planData.todos.map((todo) => (
                      <TodoCard
                        key={todo.id}
                        todo={{
                          ...todo,
                          completed: completedTodos.has(todo.id)
                        }}
                        onToggle={handleTodoToggle}
                      />
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Upcoming Deadlines */}
              {planData.deadlines && planData.deadlines.length > 0 && (
                <SectionCard 
                  title="Upcoming Deadlines"
                  icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-400" />}
                  size="md"
                >
                  <div className="space-y-4">
                    {planData.deadlines.map((deadline) => (
                      <DeadlineCard
                        key={deadline.id}
                        deadline={deadline}
                      />
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Right Column - Study Blocks and Insights */}
            <div className="space-y-8">
              
              {/* Study Blocks */}
              {planData.studyBlocks && planData.studyBlocks.length > 0 && (
                <SectionCard 
                  title="Study Sessions"
                  icon={<BookOpenIcon className="w-6 h-6 text-blue-400" />}
                  size="md"
                >
                  <div className="space-y-4">
                    {planData.studyBlocks.map((block) => (
                      <StudyBlockCard
                        key={block.id}
                        studyBlock={block}
                      />
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Insights */}
              {planData.insights && planData.insights.length > 0 && (
                <SectionCard 
                  title="AI Insights"
                  icon={<LightBulbIcon className="w-6 h-6 text-yellow-400" />}
                  size="md"
                >
                  <div className="space-y-4">
                    {planData.insights.map((insight) => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                      />
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4 pt-8">
            <div className="text-sm glass-text-secondary">
              Generated on {new Date(planData.generated_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
            <p className="text-sm glass-text-secondary">
              💡 Tip: Check off completed tasks and regenerate for updated recommendations
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Fallback for empty state
  return (
    <MainLayout showBackButton onBack={() => navigate('/home')}>
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
