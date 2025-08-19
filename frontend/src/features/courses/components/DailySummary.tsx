import { useState, useEffect } from 'react';
import { AccountService } from '@/features/account/services/account.service';
import { 
  CalendarIcon, 
  ClockIcon, 
  BellIcon, 
  SparklesIcon,
  CheckCircleIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { SectionCard, StatCard } from '@/components/common/Card/Card';
import type { UserSettings } from '@/features/account/types';
import type { CanvasCourse, CanvasAssignment, CanvasAnnouncement } from '@/types/canvas.types';

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

  const overdueAssignments = allAssignments.filter(assignment => {
    if (!assignment.due_at) return false;
    const dueDate = new Date(assignment.due_at).toISOString().split('T')[0];
    return dueDate < today && !assignment.has_submitted_submissions;
  });

  // Grade analysis
  const gradedAssignments = allAssignments.filter(a => a.grade !== null && a.grade !== undefined);
  const totalPoints = gradedAssignments.reduce((sum, a) => sum + (a.points_possible || 0), 0);
  const earnedPoints = gradedAssignments.reduce((sum, a) => {
    const grade = typeof a.grade === 'number' ? a.grade : parseFloat(a.grade as string) || 0;
    return sum + grade;
  }, 0);
  const averageGrade = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : null;

  // Recent announcements (last 3 days)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const recentAnnouncements = courses.flatMap(course =>
    course.announcements.filter(announcement => {
      if (!announcement.posted_at) return false;
      const postedDate = new Date(announcement.posted_at).toISOString().split('T')[0];
      return postedDate >= threeDaysAgo;
    }).map(announcement => ({
      ...announcement,
      courseName: course.name,
      courseCode: course.code
    }))
  ).sort((a, b) => new Date(b.posted_at!).getTime() - new Date(a.posted_at!).getTime());

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
    if (overdueAssignments.length > 0) {
      return {
        type: 'urgent',
        icon: <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />,
        message: `${overdueAssignments.length} overdue assignment${overdueAssignments.length > 1 ? 's' : ''}`,
        color: 'text-red-400'
      };
    }
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
            {averageGrade !== null && (
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrophyIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-lg font-bold glass-text-primary">{averageGrade}%</span>
                </div>
                <p className="text-xs glass-text-secondary">Average</p>
              </div>
            )}
          </div>

          {/* Priority Alert Banner */}
          <div className={`glass-chip p-3 border ${
            priorityAlert.type === 'urgent' ? 'border-red-500/30 bg-[rgba(239,68,68,0.08)]' :
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

        {/* Recent Announcements */}
        {recentAnnouncements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium glass-text-primary flex items-center gap-2">
              <BellIcon className="w-3 h-3 text-green-400" />
              Recent News
            </h4>
            <div className="space-y-2">
              {recentAnnouncements.slice(0, 2).map((announcement, index) => (
                <div key={announcement.id} className="glass-chip p-3 bg-[rgba(34,197,94,0.04)]">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium glass-text-primary truncate">
                        {announcement.title}
                      </p>
                      <p className="text-xs glass-text-secondary">
                        {announcement.courseCode} • {new Date(announcement.posted_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Stats - Bottom */}
        <div className="mt-auto grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
          <div className="text-center">
            <div className="text-xl font-bold glass-text-primary">{courses.length}</div>
            <div className="text-xs glass-text-secondary">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold glass-text-primary">{moduleProgress}%</div>
            <div className="text-xs glass-text-secondary">Progress</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold glass-text-primary">{gradedAssignments.length}</div>
            <div className="text-xs glass-text-secondary">Graded</div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}; 