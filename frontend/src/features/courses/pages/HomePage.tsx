import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { CourseList } from '../components/CourseList/CourseList';
import { UpcomingAssignments } from '../components/UpcomingAssignments/UpcomingAssignments';
import { useUpcomingAssignments } from '../hooks/useUpcomingAssignments';
import { useCourses } from '../hooks/useCourses';
import { Loading } from '@/components/common/Loading';

export const HomePage = () => {
  const { courses, loading, error, refreshCourses } = useCourses();
  const upcomingAssignments = useUpcomingAssignments(courses);

  if (loading) {
    return <Loading message="Fetching your courses... This may take a few minutes!" />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UpcomingAssignments assignments={upcomingAssignments} />
        </div>
        <div className="lg:col-span-1">
          <CourseList courses={courses} onRefresh={() => refreshCourses(true)} />
        </div>
      </div>
    </MainLayout>
  );
}; 