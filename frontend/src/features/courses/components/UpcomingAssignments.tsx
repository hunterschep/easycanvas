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
    // Navigate to chat with a new chat and pre-filled message about the assignment
    const message = `I need some help with ${assignment.name} in ${assignment.courseName}`;
    navigate(`/chat?newChat=true&message=${encodeURIComponent(message)}`);
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
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {displayedAssignments.map((assignment) => {
              const dueDateInfo = formatDueDate(assignment.due_at!);
              
              return (
                <div
                  key={`${assignment.courseCode}-${assignment.id}`}
                  className="relative group/card"
                >
                  {/* Card gradient border effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition duration-500" />
                  
                  <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300 group-hover/card:bg-gray-900/90">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                      
                      {/* Left: Assignment Info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Assignment Title & Course */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-white leading-tight group-hover/card:text-blue-100 transition-colors duration-200">
                            {assignment.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="px-3 py-1 bg-gray-800/80 border border-gray-700 rounded-full text-gray-300 font-medium">
                              {assignment.courseCode}
                            </span>
                            <span className="text-gray-400">
                              {assignment.points_possible || 0} points
                            </span>
                            {assignment.has_submitted_submissions && (
                              <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium">
                                Submitted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Center: Due Date Badge */}
                      <div className="flex-shrink-0">
                        <div className={`px-4 py-2 rounded-xl border font-semibold text-sm ${dueDateInfo.bgColor} ${dueDateInfo.color} group-hover/card:scale-105 transition-transform duration-200`}>
                          {dueDateInfo.text}
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex gap-3 flex-shrink-0">
                        <Button
                          onClick={() => handleAskAI(assignment)}
                          variant="primary"
                          className="bg-blue-600/90 hover:bg-blue-500 border-blue-600/50 hover:border-blue-500 text-white px-4 py-2.5 text-sm font-medium group-hover/card:scale-105 transition-all duration-200"
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Ask AI</span>
                        </Button>
                        
                        <Button
                          onClick={() => handleViewInCanvas(assignment)}
                          variant="secondary"
                          className="border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-4 py-2.5 text-sm font-medium group-hover/card:scale-105 transition-all duration-200"
                          disabled={!assignment.html_url}
                        >
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Canvas</span>
                        </Button>
                      </div>
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