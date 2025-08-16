import { useState, useEffect } from 'react';
import { AccountService } from '@/features/account/services/account.service';
import { 
  CalendarIcon, 
  ClockIcon, 
  BellIcon, 
  SparklesIcon,
  CheckCircleIcon,
  BookOpenIcon 
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

  // Find assignments due today
  const assignmentsDueToday = courses.flatMap(course => 
    course.assignments.filter(assignment => {
      if (!assignment.due_at) return false;
      const dueDate = new Date(assignment.due_at).toISOString().split('T')[0];
      return dueDate === today;
    }).map(assignment => ({
      ...assignment,
      courseName: course.name,
      courseCode: course.code
    }))
  );

  // Find announcements posted today
  const announcementsToday = courses.flatMap(course =>
    course.announcements.filter(announcement => {
      if (!announcement.posted_at) return false;
      const postedDate = new Date(announcement.posted_at).toISOString().split('T')[0];
      return postedDate === today;
    }).map(announcement => ({
      ...announcement,
      courseName: course.name,
      courseCode: course.code
    }))
  );

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

  return (
    <SectionCard 
      title="Daily Summary"
      icon={<CalendarIcon className="w-8 h-8 text-gray-400" />}
      size="lg"
    >
      <div className="space-y-6">
        {/* Compact Header */}
        <div className="-mt-2 sm:-mt-4 space-y-2">
          <p className="text-gray-400 text-sm font-medium">
            {dayOfWeek}, {month} {dayOfMonth}, {year}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {getTimeOfDayGreeting()}, <span className="text-gray-300">{userSettings?.first_name || 'Student'}</span>!
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Left: Today's Activity Summary */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Due Today Summary */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-white">Due Today</span>
                  </div>
                  <span className="text-lg font-bold text-white">{assignmentsDueToday.length}</span>
                </div>
                {assignmentsDueToday.length > 0 ? (
                  <p className="text-xs text-gray-400">
                    {assignmentsDueToday.slice(0, 2).map(a => a.name).join(', ')}
                    {assignmentsDueToday.length > 2 && ` +${assignmentsDueToday.length - 2} more`}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">All caught up! 🎉</p>
                )}
              </div>

              {/* Announcements Summary */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BellIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-white">New Today</span>
                  </div>
                  <span className="text-lg font-bold text-white">{announcementsToday.length}</span>
                </div>
                {announcementsToday.length > 0 ? (
                  <p className="text-xs text-gray-400">
                    {announcementsToday.slice(0, 2).map(a => a.title).join(', ')}
                    {announcementsToday.length > 2 && ` +${announcementsToday.length - 2} more`}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">All quiet today</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="text-center lg:text-right">
                <div className="text-2xl font-bold text-white">{courses.length}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Courses</div>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-2xl font-bold text-white">
                  {courses.reduce((total, course) => total + course.assignments.length, 0)}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Assignments</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}; 