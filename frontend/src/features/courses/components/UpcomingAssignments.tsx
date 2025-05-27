import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, ChatBubbleLeftRightIcon, ArrowTopRightOnSquareIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button/Button';
import type { CanvasCourse, CanvasAssignment } from '@/types/canvas.types';

interface UpcomingAssignmentsProps {
  courses: CanvasCourse[];
}

interface AssignmentWithCourse extends CanvasAssignment {
  courseName: string;
  courseCode: string;
}

export const UpcomingAssignments = ({ courses }: UpcomingAssignmentsProps) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  // Get all assignments with course info and filter for upcoming ones
  const allAssignments: AssignmentWithCourse[] = courses.flatMap(course =>
    course.assignments.map(assignment => ({
      ...assignment,
      courseName: course.name,
      courseCode: course.code
    }))
  );

  // Filter for upcoming assignments (due in the next 30 days)
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

  const upcomingAssignments = allAssignments
    .filter(assignment => {
      if (!assignment.due_at) return false;
      const dueDate = new Date(assignment.due_at);
      return dueDate >= now && dueDate <= thirtyDaysFromNow;
    })
    .sort((a, b) => {
      const dateA = new Date(a.due_at!);
      const dateB = new Date(b.due_at!);
      return dateA.getTime() - dateB.getTime();
    });

  const displayedAssignments = showAll ? upcomingAssignments : upcomingAssignments.slice(0, 6);

  const handleAskAI = (assignment: AssignmentWithCourse) => {
    // Navigate to chat with a pre-filled message about the assignment
    const message = `Tell me about my assignment "${assignment.name}" from ${assignment.courseCode}. What do I need to know?`;
    navigate(`/chat?message=${encodeURIComponent(message)}`);
  };

  const handleViewInCanvas = (assignment: AssignmentWithCourse) => {
    if (assignment.html_url) {
      window.open(assignment.html_url, '_blank');
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return {
        text: 'Due Today',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/20'
      };
    }

    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return {
        text: 'Due Tomorrow',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10 border-orange-500/20'
      };
    }

    // Check if it's within a week
    const daysUntilDue = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 7) {
      return {
        text: `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10 border-yellow-500/20'
      };
    }

    // More than a week away
    return {
      text: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      }),
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10 border-gray-500/20'
    };
  };

  if (upcomingAssignments.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <div className="relative bg-black border border-gray-800 rounded-lg p-6 sm:p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-500/10 border border-green-500/20 rounded-full p-4">
                <CalendarIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-white mb-2">
                All Caught Up!
              </h2>
              <p className="text-gray-400">
                No assignments due in the next 30 days. Great job staying on top of your work! 🎉
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-white">
                  Upcoming Assignments
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">
                  {upcomingAssignments.length} assignment{upcomingAssignments.length === 1 ? '' : 's'} due in the next 30 days
                </p>
              </div>
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {displayedAssignments.map((assignment) => {
              const dueDateInfo = formatDueDate(assignment.due_at!);
              
              return (
                <div
                  key={`${assignment.course_id}-${assignment.id}`}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 sm:p-5 hover:border-gray-700 transition-all duration-200"
                >
                  <div className="space-y-3 sm:space-y-4">
                    {/* Assignment Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-white text-sm sm:text-base leading-tight line-clamp-2">
                          {assignment.name}
                        </h3>
                        <div className={`px-2 py-1 rounded-md border text-xs font-medium flex-shrink-0 ${dueDateInfo.bgColor} ${dueDateInfo.color}`}>
                          {dueDateInfo.text}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <span className="font-medium">{assignment.courseCode}</span>
                        <span>•</span>
                        <span>{assignment.points_possible || 0} pts</span>
                        {assignment.has_submitted_submissions && (
                          <>
                            <span>•</span>
                            <span className="text-green-400">Submitted</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        onClick={() => handleAskAI(assignment)}
                        variant="primary"
                        className="flex-1 bg-blue-600 hover:bg-blue-500 border-blue-600 hover:border-blue-500 text-white text-xs sm:text-sm py-2"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span>Ask AI</span>
                      </Button>
                      
                      <Button
                        onClick={() => handleViewInCanvas(assignment)}
                        variant="secondary"
                        className="flex-1 text-xs sm:text-sm py-2"
                        disabled={!assignment.html_url}
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        <span>View in Canvas</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More/Less Button */}
          {upcomingAssignments.length > 6 && (
            <div className="text-center pt-2">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="secondary"
                className="text-sm"
              >
                {showAll ? 'Show Less' : `Show All ${upcomingAssignments.length} Assignments`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 