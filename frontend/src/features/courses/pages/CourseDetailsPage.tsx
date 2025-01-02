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
import { CourseHomepage } from '../components/CourseHomepage/CourseHomepage';

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
        
        {course.homepage && <CourseHomepage html={course.homepage} />}

        <FilterBar filterOptions={filterOptions} onFilterChange={setFilterOptions} />
        <MonthlyAssignments 
          assignments={filteredAssignments} 
          courseId={course.id}
          filterOptions={filterOptions}
        />
      </div>
    </MainLayout>
  );
}; 