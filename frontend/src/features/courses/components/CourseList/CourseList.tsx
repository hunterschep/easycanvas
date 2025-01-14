import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '../../types';
import { Button } from '@/components/common/Button/Button';

interface CourseListProps {
  courses: Course[];
  onRefresh: () => Promise<void>;
}

export const CourseList = ({ courses, onRefresh }: CourseListProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="relative group flex-1">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Courses</h2>
          <div className="relative">
            <Button
              onClick={handleRefresh}
              isLoading={refreshing}
              variant="secondary"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              Refresh
            </Button>
            {showTooltip && (
              <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 rotate-45 w-3 h-3 bg-gray-900"></div>
                <p>
                  Performs a hard refresh of your courses, fetching the latest data from Canvas.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3 flex-1">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="p-4 border border-gray-800 rounded-lg hover:border-gray-600 transition-all duration-200 cursor-pointer"
            >
              <h3 className="font-medium">{course.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 