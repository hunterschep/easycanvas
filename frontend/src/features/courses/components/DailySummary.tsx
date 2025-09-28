import { useState, useEffect } from 'react';
import { AccountService } from '@/features/account/services/account.service';
import { 
  CalendarIcon, 
  ClockIcon, 
  SparklesIcon,
  CheckCircleIcon,
  BookOpenIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { SectionCard } from '@/components/common/Card/Card';
import type { UserSettings } from '@/features/account/types';
import type { CanvasCourse, CanvasAssignment } from '@/types/canvas.types';

interface DailySummaryProps {
  courses: CanvasCourse[];
}

export const DailySummary = ({ courses }: DailySummaryProps) => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function for relative date formatting
  const getRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `${diffDays}d`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const settings = await AccountService.getUserSettings();
        setUserSettings(settings);
      } catch (error) {
        console.error('Error fetching user settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, []);

  // Get current date information
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dayOfMonth = now.getDate();
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const year = now.getFullYear();

  // Get today's date in YYYY-MM-DD format for comparison
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Enhanced assignment analysis
  const allAssignments = courses.flatMap(course => 
    course.assignments.map(assignment => ({
      ...assignment,
      courseName: course.name,
      courseCode: course.code
    }))
  );

  const assignmentsDueToday = allAssignments.filter(assignment => {
    if (!assignment.due_at) return false;
    const dueDate = new Date(assignment.due_at).toISOString().split('T')[0];
    return dueDate === today;
  });

  const assignmentsDueTomorrow = allAssignments.filter(assignment => {
    if (!assignment.due_at) return false;
    const dueDate = new Date(assignment.due_at).toISOString().split('T')[0];
    return dueDate === tomorrow;
  });

  const assignmentsDueThisWeek = allAssignments.filter(assignment => {
    if (!assignment.due_at) return false;
    const dueDate = new Date(assignment.due_at).toISOString().split('T')[0];
    return dueDate > today && dueDate <= nextWeek;
  }).sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

  // Useful analytics
  const submittedAssignments = allAssignments.filter(assignment => 
    assignment.has_submitted_submissions
  );
  
  const assignmentsWithDates = allAssignments.filter(assignment => assignment.due_at);
  const submissionRate = assignmentsWithDates.length > 0 
    ? Math.round((submittedAssignments.length / assignmentsWithDates.length) * 100) 
    : 0;

  // Next assignment due date
  const nextAssignment = assignmentsWithDates
    .filter(assignment => new Date(assignment.due_at!) > now)
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime())[0];
  
  const daysUntilNext = nextAssignment 
    ? Math.ceil((new Date(nextAssignment.due_at!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Assignment distribution by course
  const courseActivity = courses.map(course => ({
    name: course.name,
    code: course.code,
    assignmentCount: course.assignments.length
  })).sort((a, b) => b.assignmentCount - a.assignmentCount);

  const totalAssignments = allAssignments.length;

  // Module progress analysis
  const totalModules = courses.reduce((sum, course) => sum + course.modules.length, 0);
  const completedModules = courses.reduce((sum, course) => 
    sum + course.modules.filter(module => module.completed_at).length, 0
  );
  const moduleProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  if (loading) {
    return (
      <SectionCard 
        loading={true}
        title="Daily Summary"
        icon={<CalendarIcon className="w-8 h-8 text-gray-400" />}
      />
    );
  }

  // Get time of day for personalized greeting
  const getTimeOfDayGreeting = () => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Get priority alert
  const getPriorityAlert = () => {
    if (assignmentsDueToday.length > 0) {
      return {
        type: 'today',
        icon: <ClockIcon className="w-4 h-4 text-orange-400" />,
        message: `${assignmentsDueToday.length} due today`,
        color: 'text-orange-400'
      };
    }
    if (assignmentsDueTomorrow.length > 0) {
      return {
        type: 'tomorrow',
        icon: <CalendarIcon className="w-4 h-4 text-yellow-400" />,
        message: `${assignmentsDueTomorrow.length} due tomorrow`,
        color: 'text-yellow-400'
      };
    }
    return {
      type: 'good',
      icon: <CheckCircleIcon className="w-4 h-4 text-green-400" />,
      message: 'You\'re all caught up!',
      color: 'text-green-400'
    };
  };

  const priorityAlert = getPriorityAlert();

  return (
    <SectionCard 
      title="Daily Summary"
      icon={<CalendarIcon className="w-8 h-8 text-gray-400" />}
      size="lg"
      className="h-full"
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Header with Priority Alert */}
        <div className="-mt-2 sm:-mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="glass-text-secondary text-sm font-medium">
                {dayOfWeek}, {month} {dayOfMonth}, {year}
              </p>
              <h2 className="text-lg sm:text-xl font-bold glass-text-primary">
                {getTimeOfDayGreeting()}, <span className="glass-text-secondary">{userSettings?.first_name || 'Student'}</span>!
              </h2>
            </div>
          </div>

          {/* Priority Alert Banner */}
          <div className={`glass-chip p-3 border ${
            priorityAlert.type === 'today' ? 'border-orange-500/30 bg-[rgba(249,115,22,0.08)]' :
            priorityAlert.type === 'tomorrow' ? 'border-yellow-500/30 bg-[rgba(234,179,8,0.08)]' :
            'border-green-500/30 bg-[rgba(34,197,94,0.08)]'
          }`}>
            <div className="flex items-center gap-2">
              {priorityAlert.icon}
              <span className={`text-sm font-medium ${priorityAlert.color}`}>
                {priorityAlert.message}
              </span>
            </div>
          </div>
        </div>

        {/* Assignment Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-chip p-3">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-4 h-4 text-blue-400" />
              <span className="text-lg font-bold glass-text-primary">{assignmentsDueToday.length}</span>
            </div>
            <p className="text-xs glass-text-secondary">Due Today</p>
          </div>
          
          <div className="glass-chip p-3">
            <div className="flex items-center justify-between mb-2">
              <CalendarIcon className="w-4 h-4 text-purple-400" />
              <span className="text-lg font-bold glass-text-primary">{assignmentsDueThisWeek.length}</span>
            </div>
            <p className="text-xs glass-text-secondary">This Week</p>
          </div>
        </div>

        {/* Upcoming Assignments Preview */}
        {assignmentsDueThisWeek.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium glass-text-primary flex items-center gap-2">
              <ArrowRightIcon className="w-3 h-3" />
              Next Up
            </h4>
            <div className="space-y-2">
              {assignmentsDueThisWeek.slice(0, 2).map((assignment, index) => {
                const relativeDate = getRelativeDate(assignment.due_at);
                const isUrgent = relativeDate === 'Today' || relativeDate === 'Tomorrow';
                
                return (
                  <div key={assignment.id} className="glass-chip p-3 bg-[rgba(17,25,40,0.06)]">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium glass-text-primary truncate">
                          {assignment.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs glass-text-secondary">
                            {assignment.courseCode}
                          </p>
                          {assignment.points_possible && (
                            <span className="text-xs glass-text-secondary">
                              • {assignment.points_possible}pts
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <p className={`text-xs font-medium ${
                          relativeDate === 'Today' ? 'text-orange-400' :
                          relativeDate === 'Tomorrow' ? 'text-yellow-400' :
                          'glass-text-secondary'
                        }`}>
                          {relativeDate}
                        </p>
                        {assignment.has_submitted_submissions && (
                          <CheckCircleIcon className="w-3 h-3 text-green-400 mt-1 ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {assignmentsDueThisWeek.length > 2 && (
                <p className="text-xs glass-text-secondary text-center">
                  +{assignmentsDueThisWeek.length - 2} more this week
                </p>
              )}
            </div>
          </div>
        )}

        {/* Course Activity Analytics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium glass-text-primary flex items-center gap-2">
            <ChartBarIcon className="w-3 h-3 text-purple-400" />
            Course Activity
          </h4>
          <div className="space-y-2">
            {courseActivity.slice(0, 2).map((course, index) => (
              <div key={course.code} className="glass-chip p-3 bg-[rgba(147,51,234,0.04)]">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium glass-text-primary truncate">
                      {course.code}
                    </p>
                    <p className="text-xs glass-text-secondary">
                      Most active course
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-lg font-bold text-purple-400">
                      {course.assignmentCount}
                    </p>
                    <p className="text-xs glass-text-secondary">
                      assignments
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {daysUntilNext && (
              <div className="glass-chip p-3 bg-[rgba(59,130,246,0.04)]">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium glass-text-primary">
                      Next Assignment Due
                    </p>
                    <p className="text-xs glass-text-secondary truncate">
                      {nextAssignment?.name}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-lg font-bold text-blue-400">
                      {daysUntilNext}
                    </p>
                    <p className="text-xs glass-text-secondary">
                      {daysUntilNext === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Stats - Bottom */}
        <div className="mt-auto grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
          <div className="text-center">
            <div className="text-xl font-bold glass-text-primary">{courses.length}</div>
            <div className="text-xs glass-text-secondary">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold glass-text-primary">{totalAssignments}</div>
            <div className="text-xs glass-text-secondary">Total</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold glass-text-primary">{submissionRate}%</div>
            <div className="text-xs glass-text-secondary">Submitted</div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}; 