import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, ChartBarIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button/Button';
import type { CanvasCourse, CanvasAssignment } from '@/types/canvas.types';

interface CourseOverviewProps {
  courses: CanvasCourse[];
}

interface CourseStats {
  totalAssignments: number;
  gradedAssignments: number;
  pointsEarned: number;
  totalPossiblePoints: number;
  percentage: number;
}

export const CourseOverview = ({ courses }: CourseOverviewProps) => {
  const navigate = useNavigate();

  const calculateCourseStats = (assignments: CanvasAssignment[]): CourseStats => {
    let pointsEarned = 0;
    let totalPossiblePoints = 0;
    let gradedAssignments = 0;

    assignments.forEach(assignment => {
      if (assignment.points_possible > 0) {
        totalPossiblePoints += assignment.points_possible;
        
        if (assignment.grade !== null && assignment.grade !== undefined && assignment.grade !== '') {
          gradedAssignments++;
          // Handle both numeric and string grades
          const grade = typeof assignment.grade === 'string' ? parseFloat(assignment.grade) : assignment.grade;
          if (!isNaN(grade)) {
            pointsEarned += grade;
          }
        }
      }
    });

    const percentage = totalPossiblePoints > 0 ? (pointsEarned / totalPossiblePoints) * 100 : 0;

    return {
      totalAssignments: assignments.length,
      gradedAssignments,
      pointsEarned,
      totalPossiblePoints,
      percentage
    };
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleViewCourse = (courseId: number) => {
    // Navigate to a course detail page or Canvas
    // For now, we'll just log it - you can implement course detail navigation later
    console.log(`View course ${courseId}`);
  };

  if (courses.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <div className="relative bg-black border border-gray-800 rounded-lg p-6 sm:p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gray-500/10 border border-gray-500/20 rounded-full p-4">
                <BookOpenIcon className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-white mb-2">
                No Courses Found
              </h2>
              <p className="text-gray-400">
                No courses are currently available. Check your course selection or Canvas integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      <div className="relative bg-black border border-gray-800 rounded-lg p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-white">
                Course Overview
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Your academic progress across {courses.length} course{courses.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {courses.map((course) => {
              const stats = calculateCourseStats(course.assignments);
              
              return (
                <div
                  key={course.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 sm:p-5 hover:border-gray-700 transition-all duration-200 group/card"
                >
                  <div className="space-y-4">
                    {/* Course Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white text-sm sm:text-base leading-tight line-clamp-2">
                            {course.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">
                            {course.code}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <ChartBarIcon className="w-5 h-5 text-gray-400 group-hover/card:text-purple-400 transition-colors duration-200" />
                        </div>
                      </div>
                    </div>

                    {/* Points Summary */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-400">Points Earned</span>
                        <span className={`text-sm sm:text-base font-semibold ${getGradeColor(stats.percentage)}`}>
                          {stats.pointsEarned.toFixed(1)} / {stats.totalPossiblePoints.toFixed(1)}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {stats.gradedAssignments} of {stats.totalAssignments} assignments graded
                          </span>
                          <span className={`text-xs font-medium ${getGradeColor(stats.percentage)}`}>
                            {stats.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(stats.percentage)}`}
                            style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-white">
                          {stats.totalAssignments}
                        </div>
                        <div className="text-xs text-gray-400">
                          Assignment{stats.totalAssignments === 1 ? '' : 's'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-white">
                          {course.modules.length}
                        </div>
                        <div className="text-xs text-gray-400">
                          Module{course.modules.length === 1 ? '' : 's'}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleViewCourse(course.id)}
                      variant="secondary"
                      className="w-full text-xs sm:text-sm py-2 group-hover/card:border-purple-600 group-hover/card:text-purple-400 transition-colors duration-200"
                    >
                      View Course Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}; 