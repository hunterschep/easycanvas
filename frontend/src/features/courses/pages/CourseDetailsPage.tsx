import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { CourseHeader } from '../components/CourseHeader/CourseHeader';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { MonthlyAssignments } from '../components/MonthlyAssignments/MonthlyAssignments';
import { useAssignmentFilters } from '../hooks/useAssignmentFilters';
import { useGradeSummary } from '../hooks/useGradeSummary';
import { useCourse } from '../hooks/useCourse';
import { Loading } from '@/components/common/Loading';
import type { FilterOptions } from '../types';
import { CourseModules } from '../components/CourseModules/CourseModules';

export const CourseDetailsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, loading, error } = useCourse(courseId);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    showGradedOnly: false,
    sortBy: 'due_date',
    sortDirection: 'desc'
  });

  const filteredAssignments = useAssignmentFilters(course?.assignments || [], filterOptions);
  const gradeSummary = useGradeSummary(course?.assignments || []);

  if (loading) {
    return <Loading message="Loading course details..." />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!course) {
    return null;
  }

  return (
    <MainLayout showBackButton onBack={() => navigate('/home')}>
      <div className="space-y-8">
        <CourseHeader course={course} gradeSummary={gradeSummary} />
        <FilterBar filterOptions={filterOptions} onFilterChange={setFilterOptions} />
        
        <div className="space-y-8">
          <details className="group bg-black border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-all duration-200" open={false}>
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg 
                    className="w-4 h-4 transition-transform duration-200 group-open:rotate-90" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                  </svg>
                  <h2 className="text-2xl font-bold">Assignments</h2>
                </div>
                <span className="text-sm text-gray-400">{filteredAssignments.length} assignments</span>
              </div>
            </summary>
            <div className="mt-4">
              <MonthlyAssignments 
                assignments={filteredAssignments} 
                courseId={course.id}
                filterOptions={filterOptions}
              />
            </div>
          </details>
          
          <details className="group bg-black border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-all duration-200" open={false}>
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg 
                    className="w-4 h-4 transition-transform duration-200 group-open:rotate-90" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                  </svg>
                  <h2 className="text-2xl font-bold">Modules</h2>
                </div>
                <span className="text-sm text-gray-400">{course.modules.length} modules</span>
              </div>
            </summary>
            <div className="mt-4">
              <CourseModules 
                modules={course.modules} 
                courseId={course.id}
              />
            </div>
          </details>
        </div>
      </div>
    </MainLayout>
  );
}; 