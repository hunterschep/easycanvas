import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { Loading } from '@/components/common/Loading';
import { useCourses } from '../hooks/useCourses';
import { DailySummary } from '../components/DailySummary';
import { EnterChat } from '../components/EnterChat';

export const HomePage = () => {
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();

  if (coursesLoading) {
    return <Loading message="Fetching your courses... This may take a few minutes!" />;
  }

  if (coursesError) {
    return <div className="text-red-500">{coursesError}</div>;
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Daily Summary Component */}
        <DailySummary courses={courses} />
        
        {/* Enter Chat Component */}
        <EnterChat />
        
        {/* TODO: Add other components here */}
        {/* - Upcoming Assignments Component */}
        {/* - Course Data Component */}
        {/* - Analytics Board Component */}
      </div>
    </MainLayout>
  );
}; 