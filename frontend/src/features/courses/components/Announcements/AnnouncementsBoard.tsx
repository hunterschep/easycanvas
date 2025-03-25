import { useAnnouncements } from '../../hooks/useAnnouncements';
import { Course, EnhancedAnnouncement } from '../../types';
import { Button } from '@/components/common/Button/Button';
import { useState, useMemo } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';

interface AnnouncementsBoardProps {
  courses: Course[];
  onRefresh: () => void;
}

export const AnnouncementsBoard = ({ courses, onRefresh }: AnnouncementsBoardProps) => {
  const announcements = useAnnouncements(courses);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [filterCourse, setFilterCourse] = useState<number | 'all'>('all');
  const queryClient = useQueryClient();

  const toggleAnnouncement = (id: number) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleClearAnnouncement = async (announcementId: number) => {
    // Get the current announcements data from the cache
    const currentAnnouncements = queryClient.getQueryData<EnhancedAnnouncement[]>(
      ['announcements', courses.map(c => c.id)]
    );
    
    if (currentAnnouncements) {
      // Filter out the announcement to clear
      const updatedAnnouncements = currentAnnouncements.filter(
        announcement => announcement.id !== announcementId
      );
      
      // Update the cache with the filtered announcements
      queryClient.setQueryData(
        ['announcements', courses.map(c => c.id)],
        updatedAnnouncements
      );
    }
  };

  // Filter and sort announcements
  const filteredAnnouncements = useMemo(() => {
    if (!announcements.data) return [];
    
    let filtered = [...announcements.data];
    
    // Apply course filter if selected
    if (filterCourse !== 'all') {
      filtered = filtered.filter(announcement => announcement.courseId === filterCourse);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => 
      new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
    );
    
    return filtered;
  }, [announcements.data, filterCourse]);

  // Group announcements by recency
  const groupedAnnouncements = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    return {
      today: filteredAnnouncements.filter(a => {
        const date = new Date(a.posted_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
      }),
      yesterday: filteredAnnouncements.filter(a => {
        const date = new Date(a.posted_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === yesterday.getTime();
      }),
      lastWeek: filteredAnnouncements.filter(a => {
        const date = new Date(a.posted_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime() >= lastWeek.getTime() && 
               date.getTime() < yesterday.getTime();
      }),
      older: filteredAnnouncements.filter(a => {
        const date = new Date(a.posted_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime() < lastWeek.getTime();
      })
    };
  }, [filteredAnnouncements]);

  const renderAnnouncementCard = (announcement: EnhancedAnnouncement, index: number) => {
    const isExpanded = expandedIds.includes(announcement.id);
    const isHovered = hoverIndex === index;

    // Get color based on course ID for consistent visual identity
    const getAnnouncementColor = (courseId: number) => {
      const colors = [
        'border-blue-900/50 hover:border-blue-800/70 bg-blue-900/10',
        'border-purple-900/50 hover:border-purple-800/70 bg-purple-900/10',
        'border-green-900/50 hover:border-green-800/70 bg-green-900/10',
        'border-yellow-900/50 hover:border-yellow-800/70 bg-yellow-900/10',
        'border-red-900/50 hover:border-red-800/70 bg-red-900/10',
        'border-indigo-900/50 hover:border-indigo-800/70 bg-indigo-900/10',
      ];
      
      return colors[courseId % colors.length];
    };

    const borderColor = getAnnouncementColor(announcement.courseId);
    
    return (
      <div 
        key={announcement.id} 
        className={`border ${borderColor} rounded-lg transition-all duration-300 ${isExpanded ? 'bg-gray-900/20' : 'bg-black'}`}
        onMouseEnter={() => setHoverIndex(index)}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <div 
          className={`p-4 cursor-pointer flex items-center justify-between ${isExpanded ? 'border-b border-gray-800' : ''}`}
          onClick={() => toggleAnnouncement(announcement.id)}
        >
          <div className="space-y-1 flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <h3 className="font-medium text-white">{announcement.title}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-400">{announcement.courseName}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>
                {formatDistanceToNow(new Date(announcement.posted_at), { addSuffix: true })}
              </span>
              <span>
                {format(new Date(announcement.posted_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="justify-center bg-transparent hover:bg-gray-900 text-gray-300 hover:text-white border border-gray-800 hover:border-gray-600 transition-all duration-300 transform hover:translate-y-[-1px]"
              onClick={(e) => {
                e.stopPropagation();
                window.open(announcement.html_url, '_blank');
              }}
            >
              View
            </Button>
            <Button
              variant="danger"
              className="text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 transition-all duration-300 transform hover:translate-y-[-1px]"
              onClick={(e) => {
                e.stopPropagation();
                handleClearAnnouncement(announcement.id);
              }}
            >
              Dismiss
            </Button>
            <div className="w-6 flex justify-center">
              {isExpanded ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-4 bg-black/30">
            <div 
              className="text-sm text-gray-300 prose prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: announcement.message }} 
            />
          </div>
        )}
      </div>
    );
  };

  // Render section with heading
  const renderSection = (title: string, announcements: EnhancedAnnouncement[]) => {
    if (announcements.length === 0) return null;
    
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400 pl-2 border-l-2 border-gray-700">{title}</h3>
        {announcements.map((announcement, index) => 
          renderAnnouncementCard(announcement, index)
        )}
      </div>
    );
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg p-6">
        {/* Header with filter controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Announcements</h2>
            <div className="text-sm text-gray-500">
              {announcements.data?.length || 0} total
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gray-700 hover:border-gray-700 transition-colors"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            
            <Button
              onClick={onRefresh}
              className="justify-center bg-transparent hover:bg-gray-900 text-gray-300 hover:text-white border border-gray-800 hover:border-gray-600 transition-all duration-300 transform hover:translate-y-[-1px]"
            >
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {announcements.data?.length === 0 || filteredAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-12 h-12 text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-gray-500 text-lg">No announcements to display</p>
              <p className="text-gray-600 text-sm mt-1">
                {announcements.data?.length === 0 
                  ? "Your instructors haven't posted any announcements yet" 
                  : "Try changing your filter to see more announcements"}
              </p>
            </div>
          ) : (
            <>
              {renderSection('Today', groupedAnnouncements.today)}
              {renderSection('Yesterday', groupedAnnouncements.yesterday)}
              {renderSection('Last 7 days', groupedAnnouncements.lastWeek)}
              {renderSection('Older', groupedAnnouncements.older)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};