import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { Loading } from '@/components/common/Loading';
import { useCourses } from '../hooks/useCourses';

export const HomePage = () => {
  const { courses, loading, error } = useCourses();

  // Get all assignments across all courses
  const allAssignments = courses.flatMap(course => course.assignments);
  // Get all announcements across all courses
  const allAnnouncements = courses.flatMap(course => course.announcements);
  // Get all modules and module items 
  const allModules = courses.flatMap(course => course.modules);
  const allModuleItems = courses.flatMap(course => course.modules.flatMap(module => module.items_count));

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
            There are {courses.length} courses with a total of {allAssignments.length} assignments and {allAnnouncements.length} announcements. 
            There are {allModules.length} modules with a total of {allModuleItems.length} module items.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}; 