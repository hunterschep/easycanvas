import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { useCourses } from '../hooks/useCourses';
import { Loading } from '@/components/common/Loading';

export const HomePage = () => {
  const { courses, loading, error } = useCourses();

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
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Welcome to EasyCanvas</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your courses and assignments are successfully loaded.
            There are {courses.length} courses with a total of {allAssignments.length} assignments.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}; 