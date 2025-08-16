// import { useNavigate } from 'react-router-dom'; // TODO: Implement course detail navigation
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button/Button';
import { SectionCard } from '@/components/common/Card/Card';
import type { CanvasCourse, CanvasAssignment } from '@/types/canvas.types';

interface CourseOverviewProps {
  courses: CanvasCourse[];
}

interface CourseStats {
  totalAssignments: number;
  gradedAssignments: number;
  pointsEarned: number;
  totalPossiblePointsFromGraded: number;
  percentage: number;
}

export const CourseOverview = ({ courses }: CourseOverviewProps) => {
  // const navigate = useNavigate(); // TODO: Implement course detail navigation

  const calculateCourseStats = (assignments: CanvasAssignment[]): CourseStats => {
    let pointsEarned = 0;
    let totalPossiblePointsFromGraded = 0;
    let gradedAssignments = 0;

    assignments.forEach(assignment => {
      if (assignment.grade !== null && assignment.grade !== undefined && assignment.grade !== '') {
        // Only count assignments that have been graded
        const grade = typeof assignment.grade === 'string' ? parseFloat(assignment.grade) : assignment.grade;
        if (!isNaN(grade) && grade > 0 && assignment.points_possible > 0) {
          gradedAssignments++;
          pointsEarned += grade;
          totalPossiblePointsFromGraded += assignment.points_possible;
        }
      }
    });

    const percentage = totalPossiblePointsFromGraded > 0 ? (pointsEarned / totalPossiblePointsFromGraded) * 100 : 0;

    return {
      totalAssignments: assignments.length,
      gradedAssignments,
      pointsEarned,
      totalPossiblePointsFromGraded,
      percentage
    };
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-gradient-to-r from-emerald-500 to-green-400';
    if (percentage >= 80) return 'bg-gradient-to-r from-blue-500 to-cyan-400';
    if (percentage >= 70) return 'bg-gradient-to-r from-yellow-500 to-amber-400';
    if (percentage >= 60) return 'bg-gradient-to-r from-orange-500 to-red-400';
    return 'bg-gradient-to-r from-red-500 to-pink-400';
  };

  const handleViewCourse = (courseId: number) => {
    // Navigate to a course detail page or Canvas
    // For now, we'll just log it - you can implement course detail navigation later
    console.log(`View course ${courseId}`);
  };

  if (courses.length === 0) {
    return (
      <SectionCard 
        title="Course Overview"
        icon={<AcademicCapIcon className="w-8 h-8 text-gray-400" />}
        size="lg"
      >
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center">
            <div className="bg-gray-500/10 border border-gray-500/20 rounded-full p-6">
              <BookOpenIcon className="w-16 h-16 text-gray-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No Courses Found
            </h3>
            <p className="text-gray-300 text-lg mb-4">
              No courses are currently available.
            </p>
            <p className="text-gray-400">
              Check your course selection or Canvas integration.
            </p>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard 
      title="Course Overview"
      icon={<AcademicCapIcon className="w-8 h-8 text-gray-400" />}
      size="lg"
    >
      <div className="space-y-6">
        {/* Compact Header */}
        <div className="-mt-2 sm:-mt-4 space-y-2">
          <p className="text-gray-300 text-base font-medium">
            Your academic progress across {courses.length} course{courses.length === 1 ? '' : 's'}
          </p>
          
          {/* Overall Stats - Compact */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-300 font-medium">
              {(() => {
                const overallStats = courses.reduce((acc, course) => {
                  const stats = calculateCourseStats(course.assignments);
                  return {
                    totalPoints: acc.totalPoints + stats.pointsEarned,
                    totalPossible: acc.totalPossible + stats.totalPossiblePointsFromGraded
                  };
                }, { totalPoints: 0, totalPossible: 0 });
                const overallPercentage = overallStats.totalPossible > 0 
                  ? (overallStats.totalPoints / overallStats.totalPossible) * 100 
                  : 0;
                return `${overallPercentage.toFixed(1)}% overall`;
              })()}
            </span>
            
            <span className="text-gray-400">
              {courses.reduce((total, course) => {
                return total + calculateCourseStats(course.assignments).gradedAssignments;
              }, 0)} graded assignments
            </span>
          </div>
        </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course) => {
              const stats = calculateCourseStats(course.assignments);
              
              return (
                <div
                  key={course.id}
                  className="relative group/card h-full"
                >
                  {/* Card gradient border effect - much more subtle */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600/10 via-gray-500/10 to-gray-600/10 rounded-xl blur opacity-0 group-hover/card:opacity-60 transition-opacity duration-700" />
                  
                  <div className="relative bg-black border border-gray-800 rounded-xl p-6 sm:p-8 hover:border-gray-700 transition-all duration-300 group-hover/card:bg-gray-900/30 h-full flex flex-col">
                    <div className="space-y-6 flex-1 flex flex-col">
                      
                      {/* Course Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-bold text-white leading-tight group-hover/card:text-gray-100 transition-colors duration-200 mb-2 line-clamp-2">
                            {course.name}
                          </h3>
                        </div>
                        <div className="flex-shrink-0">
                          <ChartBarIcon className="w-6 h-6 text-gray-400 group-hover/card:text-gray-300 transition-colors duration-200" />
                        </div>
                      </div>

                      {/* Grade Display - flex-1 to push button to bottom */}
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 font-medium">Current Grade</span>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getGradeColor(stats.percentage)}`}>
                              {stats.percentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-400">
                              {stats.pointsEarned.toFixed(1)} / {stats.totalPossiblePointsFromGraded.toFixed(1)} pts
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">
                              {stats.gradedAssignments} of {stats.totalAssignments} assignments graded
                            </span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressBarColor(stats.percentage)}`}
                              style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                          <div className="text-center space-y-1">
                            <div className="text-2xl font-bold text-white group-hover/card:text-gray-100 transition-colors duration-200">
                              {stats.totalAssignments}
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">
                              Total Assignments
                            </div>
                          </div>
                          <div className="text-center space-y-1">
                            <div className="text-2xl font-bold text-white group-hover/card:text-gray-100 transition-colors duration-200">
                              {stats.gradedAssignments}
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">
                              Graded
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button - always at bottom */}
                      <div className="pt-4">
                        <Button
                          onClick={() => handleViewCourse(course.id)}
                          variant="secondary"
                          fullWidth
                          size="sm"
                        >
                          View Course Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </SectionCard>
  );
}; 