import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '../../types';
import { Button } from '@/components/common/Button/Button';
import { getCourseColorClass } from '../../utils/courseColors';

interface CourseListProps {
  courses: Course[];
  onRefresh: () => Promise<void>;
}

export const CourseList = ({ courses, onRefresh }: CourseListProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  // // Generate a color based on course name for consistent visual identity
  // const getCourseColor = (name: string) => {
  //   const colors = [
  //     'from-blue-900/30 to-blue-800/5 border-blue-900/50 hover:border-blue-700',
  //     'from-purple-900/30 to-purple-800/5 border-purple-900/50 hover:border-purple-700',
  //     'from-green-900/30 to-green-800/5 border-green-900/50 hover:border-green-700',
  //     'from-yellow-900/30 to-yellow-800/5 border-yellow-900/50 hover:border-yellow-700',
  //     'from-red-900/30 to-red-800/5 border-red-900/50 hover:border-red-700',
  //     'from-indigo-900/30 to-indigo-800/5 border-indigo-900/50 hover:border-indigo-700',
  //     'from-pink-900/30 to-pink-800/5 border-pink-900/50 hover:border-pink-700',
  //   ];
    
  //   // Use the sum of character codes to pick a consistent color
  //   const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  //   return colors[sum % colors.length];
  // };

  return (
    <div className="relative group flex-1">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Your Courses</h2>
          <div className="relative">
            <Button
              onClick={handleRefresh}
              isLoading={refreshing}
              variant="secondary"
              className="justify-center bg-transparent hover:bg-gray-900 text-gray-300 hover:text-white border border-gray-800 hover:border-gray-600 transition-all duration-300 transform hover:translate-y-[-2px]"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              Refresh
            </Button>
            {showTooltip && (
              <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-900"></div>
                <p>
                  Performs a hard refresh of your courses, fetching the latest data from Canvas.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {courses.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p>No courses found.</p>
              <p className="text-sm mt-2">Try refreshing or check your Canvas account.</p>
            </div>
          ) : (
            courses.map((course, index) => {
              // Extract course code from name if available (e.g. "CS101: Intro to Programming" -> "CS101")
              const courseCode = course.name.match(/^([A-Z]+[0-9]+):/i)?.[1] || "";
              const colorClass = getCourseColorClass(course, 'cardBg');
              
              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}`)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`relative p-4 border rounded-lg bg-gradient-to-r ${colorClass} transition-all duration-300 cursor-pointer transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/50`}
                >
                  <div className="flex items-start gap-3">
                    {courseCode && (
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-black/50 border border-gray-800 flex items-center justify-center text-white font-bold">
                        {courseCode}
                      </div>
                    )}
                    <div className="flex-grow">
                      <h3 className="font-medium text-white">{course.name}</h3>
                      
                      <div className="flex items-center mt-1 gap-3">
                        {course.assignments && (
                          <div className="flex items-center text-xs">
                            <span className="text-gray-400">
                              {course.assignments.length} assignment{course.assignments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        
                        {/* Show unread status or other notifications */}
                        {activeIndex === index && (
                          <div className="flex mt-2 gap-2">
                            <span className="px-2 py-0.5 text-xs rounded bg-black/50 text-gray-300 border border-gray-800">
                              View Details
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};