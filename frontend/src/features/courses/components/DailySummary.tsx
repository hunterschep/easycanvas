import { useState, useEffect } from 'react';
import { AccountService } from '@/features/account/services/account.service';
import { CalendarIcon, ClockIcon, BellIcon } from '@heroicons/react/24/outline';
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
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <div className="relative bg-black border border-gray-800 rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
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
          {/* Greeting */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-white mb-2">
              Hey there, <span className="text-gray-400">{userSettings?.first_name || 'Student'}</span>!
            </h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm sm:text-base">
              <CalendarIcon className="w-5 h-5 flex-shrink-0" />
              <span>
                {dayOfWeek}, {month} {dayOfMonth}, {year}
              </span>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Assignments Due Today */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-white">Due Today</h3>
              </div>
              
              {assignmentsDueToday.length > 0 ? (
                <div className="space-y-2">
                  {assignmentsDueToday.slice(0, 3).map((assignment) => (
                    <div key={`${assignment.course_id}-${assignment.id}`} className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
                      <h4 className="font-medium text-white text-sm sm:text-base truncate">
                        {assignment.name}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {assignment.courseCode} • {assignment.points_possible || 0} pts
                      </p>
                    </div>
                  ))}
                  {assignmentsDueToday.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{assignmentsDueToday.length - 3} more assignments due today
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No assignments due today! 🎉</p>
              )}
            </div>

            {/* Announcements Today */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BellIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-white">New Today</h3>
              </div>
              
              {announcementsToday.length > 0 ? (
                <div className="space-y-2">
                  {announcementsToday.slice(0, 3).map((announcement) => (
                    <div key={`${announcement.id}`} className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
                      <h4 className="font-medium text-white text-sm sm:text-base truncate">
                        {announcement.title}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {announcement.courseCode}
                      </p>
                    </div>
                  ))}
                  {announcementsToday.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{announcementsToday.length - 3} more announcements today
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No new announcements today</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="pt-4 border-t border-gray-800">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{courses.length}</p>
                <p className="text-xs text-gray-400">Active Courses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {courses.reduce((total, course) => total + course.assignments.length, 0)}
                </p>
                <p className="text-xs text-gray-400">Total Assignments</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {courses.reduce((total, course) => total + course.announcements.length, 0)}
                </p>
                <p className="text-xs text-gray-400">Announcements</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {courses.reduce((total, course) => total + course.modules.length, 0)}
                </p>
                <p className="text-xs text-gray-400">Modules</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 