import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClockIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowTopRightOnSquareIcon, 
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button/Button';
import { SectionCard } from '@/components/common/Card/Card';
import type { CanvasCourse, CanvasAssignment } from '@/types/canvas.types';

interface UpcomingAssignmentsProps {
  courses: CanvasCourse[];
}

interface AssignmentWithCourse extends CanvasAssignment {
  courseName: string;
  courseCode: string;
}

const CLEARED_ASSIGNMENTS_KEY = 'easycanvas-cleared-assignments';

export const UpcomingAssignments = ({ courses }: UpcomingAssignmentsProps) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [clearedAssignments, setClearedAssignments] = useState<Set<number>>(new Set());

  // Load cleared assignments from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CLEARED_ASSIGNMENTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setClearedAssignments(new Set(parsed));
      } catch (error) {
        console.error('Error loading cleared assignments:', error);
      }
    }
  }, []);

  // Save cleared assignments to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      CLEARED_ASSIGNMENTS_KEY, 
      JSON.stringify(Array.from(clearedAssignments))
    );
  }, [clearedAssignments]);

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
      if (clearedAssignments.has(assignment.id)) return false;
      const dueDate = new Date(assignment.due_at);
      return dueDate >= now && dueDate <= thirtyDaysFromNow;
    })
    .sort((a, b) => {
      const dateA = new Date(a.due_at!);
      const dateB = new Date(b.due_at!);
      return dateA.getTime() - dateB.getTime();
    });

  const displayedAssignments = showAll ? upcomingAssignments : upcomingAssignments.slice(0, 6);

  const handleClearAssignment = (assignmentId: number) => {
    setClearedAssignments(prev => new Set([...prev, assignmentId]));
  };

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
      <SectionCard 
        title="Upcoming Assignments"
        icon={<ClockIcon className="w-8 h-8 text-green-400" />}
        variant="green"
        size="lg"
      >
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center">
            <div className="bg-green-500/10 border border-green-500/20 rounded-full p-6">
              <CheckCircleIcon className="w-16 h-16 text-green-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold glass-text-primary mb-3">
              All Caught Up!
            </h3>
            <p className="glass-text-secondary text-lg mb-4">
              No assignments due in the next 30 days.
            </p>
            <p className="text-green-400 font-medium">
              Great job staying on top of your work! 🎉
            </p>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard 
      title="Upcoming Assignments"
      icon={<ClockIcon className="w-8 h-8 text-blue-400" />}
      size="lg"
    >
      <div className="space-y-6">
        {/* Compact Header */}
        <div className="-mt-2 sm:-mt-4 space-y-2">
          <p className="glass-text-secondary text-base font-medium">
            {upcomingAssignments.length} assignment{upcomingAssignments.length === 1 ? '' : 's'} due in the next 30 days
          </p>
          
          {/* Priority Summary - Only show if there are urgent items */}
          {(upcomingAssignments.filter(a => {
            const dueDate = new Date(a.due_at!);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 2); // Next 2 days
            return dueDate <= tomorrow;
          }).length > 0) && (
            <div className="flex items-center gap-4 text-sm">
              {upcomingAssignments.filter(a => {
                const dueDate = new Date(a.due_at!);
                const today = new Date();
                return dueDate.toDateString() === today.toDateString();
              }).length > 0 && (
                <span className="text-red-400 font-medium">
                  {upcomingAssignments.filter(a => {
                    const dueDate = new Date(a.due_at!);
                    const today = new Date();
                    return dueDate.toDateString() === today.toDateString();
                  }).length} due today
                </span>
              )}
              
              {upcomingAssignments.filter(a => {
                const dueDate = new Date(a.due_at!);
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                return dueDate.toDateString() === tomorrow.toDateString();
              }).length > 0 && (
                <span className="text-orange-400 font-medium">
                  {upcomingAssignments.filter(a => {
                    const dueDate = new Date(a.due_at!);
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return dueDate.toDateString() === tomorrow.toDateString();
                  }).length} due tomorrow
                </span>
              )}
            </div>
          )}
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
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-[var(--radius-lg)] blur opacity-0 group-hover/card:opacity-40 transition duration-500" />
                  
                  <div className="relative glass p-6 hover:bg-[rgba(17,25,40,0.16)] transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                      
                      {/* Left: Assignment Info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Assignment Title & Course */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold glass-text-primary leading-tight group-hover/card:text-blue-100 transition-colors duration-200">
                            {assignment.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="px-3 py-1 glass-chip font-medium">
                              {assignment.courseCode}
                            </span>
                            <span className="glass-text-secondary">
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
                        <div className={`px-4 py-2 rounded-xl border font-semibold text-sm ${dueDateInfo.bgColor} ${dueDateInfo.color} group-hover/card:scale-[1.02] transition-transform duration-200`}>
                          {dueDateInfo.text}
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleClearAssignment(assignment.id)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<XMarkIcon className="w-4 h-4" />}
                          className="group-hover/card:scale-[1.02] transition-all duration-200 text-gray-400 hover:text-red-400"
                          title="Clear assignment"
                        >
                          <span className="sr-only">Clear</span>
                        </Button>
                        
                        <Button
                          onClick={() => handleAskAI(assignment)}
                          variant="primary"
                          size="sm"
                          leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
                          className="group-hover/card:scale-[1.02] transition-all duration-200"
                        >
                          <span className="hidden sm:inline">Ask AI</span>
                        </Button>
                        
                        <Button
                          onClick={() => handleViewInCanvas(assignment)}
                          variant="secondary"
                          size="sm"
                          leftIcon={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                          disabled={!assignment.html_url}
                          className="group-hover/card:scale-[1.02] transition-all duration-200"
                        >
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
              variant="ghost"
              size="sm"
            >
              {showAll ? 'Show Less' : `Show All ${upcomingAssignments.length} Assignments`}
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}; 