
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { Loading } from '@/components/common/Loading';
import { Card } from '@/components/common/Card/Card';
import { useCourses } from '../hooks/useCourses';
import { DailySummary } from '../components/DailySummary';
import { EnterChat } from '../components/EnterChat';
import { UpcomingAssignments } from '../components/UpcomingAssignments';
import { CourseOverview } from '../components/CourseOverview';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const HomePage = () => {
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();

  console.log('HomePage render:', {
    coursesLoading,
    coursesError,
    coursesCount: courses?.length || 0,
    timestamp: new Date().toISOString()
  });

  if (coursesLoading) {
    console.log('HomePage showing loading screen');
    return <Loading message="Fetching your courses... This may take a few minutes!" />;
  }

  if (coursesError) {
    console.log('HomePage showing error:', coursesError);
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card variant="red" size="lg" className="max-w-2xl mx-auto text-center">
            <div className="flex flex-col items-center space-y-4">
              <ExclamationTriangleIcon className="w-16 h-16 text-red-400" />
              <div>
                <h2 className="text-2xl font-bold glass-text-primary mb-2">Unable to Load Courses</h2>
                <p className="glass-text-secondary mb-4">{coursesError}</p>
                <p className="text-sm glass-text-secondary">
                  Please check your Canvas connection or try refreshing the page.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  console.log('HomePage rendering main content with courses:', courses?.length);
  return (
    <MainLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-12">
        {/* Welcome Section */}
        <div className="text-center space-y-4 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black glass-text-primary tracking-tighter">
            Your Course Dashboard
          </h1>
          <p className="text-lg sm:text-xl glass-text-secondary max-w-3xl mx-auto">
            Stay on top of your assignments, track your progress, and get AI-powered insights
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-8 lg:space-y-12">
          {/* Top Row: Daily Summary and Chat side by side on large screens */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:items-stretch">
            <DailySummary courses={courses} />
            <EnterChat />
          </div>
          
          {/* Full width components */}
          <UpcomingAssignments courses={courses} />
          
          <CourseOverview courses={courses} />
        </div>
      </div>
    </MainLayout>
  );
}; 