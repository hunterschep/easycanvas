import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BellIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowTopRightOnSquareIcon, 
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button/Button';
import { SectionCard } from '@/components/common/Card/Card';
import type { CanvasCourse, CanvasAnnouncement } from '@/types/canvas.types';

interface AnnouncementsProps {
  courses: CanvasCourse[];
}

interface AnnouncementWithCourse extends CanvasAnnouncement {
  courseName: string;
  courseCode: string;
}

const CLEARED_ANNOUNCEMENTS_KEY = 'easycanvas-cleared-announcements';

export const Announcements = ({ courses }: AnnouncementsProps) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [clearedAnnouncements, setClearedAnnouncements] = useState<Set<number>>(new Set());
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<number>>(new Set());

  // Load cleared announcements from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CLEARED_ANNOUNCEMENTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setClearedAnnouncements(new Set(parsed));
      } catch (error) {
        console.error('Error loading cleared announcements:', error);
      }
    }
  }, []);

  // Save cleared announcements to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      CLEARED_ANNOUNCEMENTS_KEY, 
      JSON.stringify(Array.from(clearedAnnouncements))
    );
  }, [clearedAnnouncements]);

  // Get all announcements with course info and filter for recent ones
  const allAnnouncements: AnnouncementWithCourse[] = courses.flatMap(course =>
    course.announcements.map(announcement => ({
      ...announcement,
      courseName: course.name,
      courseCode: course.code
    }))
  );

  // Filter for recent announcements (last 14 days) and exclude cleared ones
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

  const recentAnnouncements = allAnnouncements
    .filter(announcement => {
      if (!announcement.posted_at) return false;
      if (clearedAnnouncements.has(announcement.id)) return false;
      const postedDate = new Date(announcement.posted_at);
      return postedDate >= fourteenDaysAgo;
    })
    .sort((a, b) => {
      const dateA = new Date(a.posted_at!);
      const dateB = new Date(b.posted_at!);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });

  const displayedAnnouncements = showAll ? recentAnnouncements : recentAnnouncements.slice(0, 6);

  const handleClearAnnouncement = (announcementId: number) => {
    setClearedAnnouncements(prev => new Set([...prev, announcementId]));
  };

  const handleToggleExpand = (announcementId: number) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  const handleAskAI = (announcement: AnnouncementWithCourse) => {
    // Navigate to chat with a new chat and pre-filled message about the announcement
    const message = `I have a question about this announcement: "${announcement.title}" from ${announcement.courseName}`;
    navigate(`/chat?newChat=true&message=${encodeURIComponent(message)}`);
  };

  const handleViewInCanvas = (announcement: AnnouncementWithCourse) => {
    if (announcement.url) {
      window.open(announcement.url, '_blank');
    }
  };

  const formatPostedDate = (postedDate: string) => {
    const date = new Date(postedDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return {
        text: 'Today',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/20'
      };
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return {
        text: 'Yesterday',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/20'
      };
    }

    // Check if it's within a week
    const daysAgo = Math.ceil((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo <= 7) {
      return {
        text: `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10 border-yellow-500/20'
      };
    }

    // More than a week ago
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

  if (recentAnnouncements.length === 0) {
    return (
      <SectionCard 
        title="Recent Announcements"
        icon={<BellIcon className="w-8 h-8 text-green-400" />}
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
              No new announcements in the last 14 days.
            </p>
            <p className="text-green-400 font-medium">
              You're up to date with all course news! 📢
            </p>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard 
      title="Recent Announcements"
      icon={<BellIcon className="w-8 h-8 text-purple-400" />}
      size="lg"
    >
      <div className="space-y-6">
        {/* Compact Header */}
        <div className="-mt-2 sm:-mt-4 space-y-2">
          <p className="glass-text-secondary text-base font-medium">
            {recentAnnouncements.length} announcement{recentAnnouncements.length === 1 ? '' : 's'} from the last 14 days
          </p>
          
          {/* Today's announcements summary */}
          {recentAnnouncements.filter(a => {
            const postedDate = new Date(a.posted_at!);
            const today = new Date();
            return postedDate.toDateString() === today.toDateString();
          }).length > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400 font-medium">
                {recentAnnouncements.filter(a => {
                  const postedDate = new Date(a.posted_at!);
                  const today = new Date();
                  return postedDate.toDateString() === today.toDateString();
                }).length} posted today
              </span>
            </div>
          )}
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {displayedAnnouncements.map((announcement) => {
            const postedDateInfo = formatPostedDate(announcement.posted_at!);
            const isExpanded = expandedAnnouncements.has(announcement.id);
            const hasMessage = announcement.message && announcement.message.trim().length > 0;
            const shouldShowExpander = hasMessage && announcement.message.length > 200;
            
            return (
              <div
                key={`${announcement.courseCode}-${announcement.id}`}
                className="relative group/card"
              >
                {/* Card gradient border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-[var(--radius-lg)] blur opacity-0 group-hover/card:opacity-40 transition duration-500" />
                
                <div className="relative glass p-6 hover:bg-[rgba(17,25,40,0.16)] transition-all duration-300">
                  <div className="flex flex-col gap-4">
                    
                    {/* Header Row */}
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                      {/* Left: Announcement Info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Announcement Title & Course */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-bold glass-text-primary leading-tight group-hover/card:text-blue-100 transition-colors duration-200 flex-1">
                              {announcement.title}
                            </h3>
                            {shouldShowExpander && (
                              <button
                                onClick={() => handleToggleExpand(announcement.id)}
                                className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors duration-200"
                                title={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                {isExpanded ? (
                                  <ChevronUpIcon className="w-5 h-5 glass-text-secondary" />
                                ) : (
                                  <ChevronDownIcon className="w-5 h-5 glass-text-secondary" />
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="px-3 py-1 glass-chip font-medium">
                              {announcement.courseCode}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Date and Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
                        {/* Posted Date Badge */}
                        <div className={`px-4 py-2 rounded-xl border font-semibold text-sm ${postedDateInfo.bgColor} ${postedDateInfo.color} group-hover/card:scale-[1.02] transition-transform duration-200`}>
                          {postedDateInfo.text}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleClearAnnouncement(announcement.id)}
                            variant="ghost"
                            size="sm"
                            leftIcon={<XMarkIcon className="w-4 h-4" />}
                            className="group-hover/card:scale-[1.02] transition-all duration-200 text-gray-400 hover:text-red-400"
                            title="Clear announcement"
                          >
                            <span className="sr-only">Clear</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleAskAI(announcement)}
                            variant="primary"
                            size="sm"
                            leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
                            className="group-hover/card:scale-[1.02] transition-all duration-200"
                          >
                            <span className="hidden sm:inline">Ask AI</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleViewInCanvas(announcement)}
                            variant="secondary"
                            size="sm"
                            leftIcon={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                            disabled={!announcement.url}
                            className="group-hover/card:scale-[1.02] transition-all duration-200"
                          >
                            <span className="hidden sm:inline">Canvas</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    {hasMessage && (
                      <div className="border-t border-white/10 pt-4">
                        {isExpanded || !shouldShowExpander ? (
                          /* Full Message */
                          <div 
                            className="text-sm glass-text-secondary leading-relaxed prose prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: announcement.message 
                            }}
                          />
                        ) : (
                          /* Truncated Message */
                          <div className="text-sm glass-text-secondary leading-relaxed">
                            {announcement.message.replace(/<[^>]*>/g, '').slice(0, 200)}
                            {announcement.message.length > 200 && (
                              <>
                                ...
                                <button
                                  onClick={() => handleToggleExpand(announcement.id)}
                                  className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                                >
                                  Read more
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {recentAnnouncements.length > 6 && (
          <div className="text-center pt-2">
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="ghost"
              size="sm"
            >
              {showAll ? 'Show Less' : `Show All ${recentAnnouncements.length} Announcements`}
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  );
};
