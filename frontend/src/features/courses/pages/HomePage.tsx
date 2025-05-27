import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout/MainLayout';
import { Loading } from '@/components/common/Loading';
import { useCourses } from '../hooks/useCourses';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export const HomePage = () => {
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();

  // Get all assignments across all courses
  const allAssignments = courses.flatMap(course => course.assignments);
  // Get all announcements across all courses
  const allAnnouncements = courses.flatMap(course => course.announcements);
  // Get all modules and module items 
  const allModules = courses.flatMap(course => course.modules);
  const totalModuleItems = courses.flatMap(course => 
    course.modules.flatMap(module => module.items)
  ).length;

  if (coursesLoading) {
    return <Loading message="Fetching your courses... This may take a few minutes!" />;
  }

  if (coursesError) {
    return <div className="text-red-500">{coursesError}</div>;
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to EasyCanvas</h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Your courses and assignments are successfully loaded.
            There are {courses.length} courses with a total of {allAssignments.length} assignments and {allAnnouncements.length} announcements. 
            There are {allModules.length} modules with a total of {totalModuleItems} module items.
          </p>
          
          {/* Chat CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">AI Chat Assistant</h2>
            <p className="text-blue-100 mb-4">
              Get help with your courses, assignments, and Canvas questions using our AI assistant.
            </p>
            <Link
              to="/chat"
              className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Start Chatting
            </Link>
          </div>
        </div>
        
        {/* Course Overview Cards */}
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">Your Courses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{course.name}</h3>
                                 <p className="text-gray-600 text-sm mb-4">{course.code}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assignments:</span>
                    <span className="font-medium">{course.assignments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Announcements:</span>
                    <span className="font-medium">{course.announcements.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modules:</span>
                    <span className="font-medium">{course.modules.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}; 