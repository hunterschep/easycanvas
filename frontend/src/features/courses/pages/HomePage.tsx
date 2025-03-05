import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { CourseList } from '../components/CourseList/CourseList';
import { UpcomingAssignments } from '../components/UpcomingAssignments/UpcomingAssignments';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard/AnalyticsDashboard';
import { AnnouncementsBoard } from '../components/Announcements/AnnouncementsBoard';
import { useUpcomingAssignments } from '../hooks/useUpcomingAssignments';
import { useCourses } from '../hooks/useCourses';
import { Loading } from '@/components/common/Loading';
import { Calendar } from '../components/Calendar/Calendar';

export const HomePage = () => {
  const { courses, loading, error, refreshCourses } = useCourses();
  const upcomingAssignments = useUpcomingAssignments(courses);

  // Get all assignments across all courses
  const allAssignments = courses.flatMap(course => course.assignments);

  if (loading) {
    return <Loading message="Fetching your courses... This may take a few minutes!" />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Announcements Dashboard */}
        <p className="text-2xl font-bold">Announcements</p>
        <div className="mb-8">
          <AnnouncementsBoard courses={courses} onRefresh={() => refreshCourses(true)} />
        </div>
        {/* Analytics Dashboard */}
        <p className="text-2xl font-bold">Analytics</p>
        <div className="mb-8">
          <AnalyticsDashboard assignments={allAssignments} />
        </div>

        {/* Existing Grid Layout */}
        <p className="text-2xl font-bold">Courses & Assignments</p>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 h-full">
          <div className="lg:col-span-4 h-full">
            <div className="h-full flex">
              <UpcomingAssignments assignments={upcomingAssignments} />
            </div>
          </div>
          <div className="lg:col-span-2 h-full">
            <div className="h-full flex">
              <CourseList courses={courses} onRefresh={() => refreshCourses(true)} />
            </div>
          </div>
        </div>
        <p className="text-2xl font-bold">Your Calendar</p>
          <div className="mb-8">
            <Calendar assignments={allAssignments} courses={courses} />
          </div>
      </div>
    </MainLayout>
  );
}; 