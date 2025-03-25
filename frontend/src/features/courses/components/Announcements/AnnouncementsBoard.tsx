import { useAnnouncements } from '../../hooks/useAnnouncements';
import { Course, EnhancedAnnouncement } from '../../types';
import { Button } from '@/components/common/Button/Button';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface AnnouncementsBoardProps {
  courses: Course[];
  onRefresh: () => void;
}

export const AnnouncementsBoard = ({ courses, onRefresh }: AnnouncementsBoardProps) => {
  const announcements = useAnnouncements(courses);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleAnnouncement = (id: number) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleClearAnnouncement = async (announcementId: number) => {
    // TODO: Implement clear announcement functionality
    console.log('Clear announcement:', announcementId);
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg p-6">
        <div className="max-h-[400px] overflow-y-auto space-y-4">
          {announcements.data?.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No announcements to display</p>
          ) : (
            announcements.data?.map((announcement: EnhancedAnnouncement) => (
              <div 
                key={announcement.id} 
                className="border border-gray-800 rounded-lg hover:border-gray-600 transition-all duration-200"
              >
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleAnnouncement(announcement.id)}
                >
                  <div className="space-y-1 flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{announcement.title}</h3>
                      <span className="text-sm text-gray-400">• {announcement.courseName}</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Posted: {new Date(announcement.posted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(announcement.html_url, '_blank');
                      }}
                    >
                      View in Canvas
                    </Button>
                    <Button
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearAnnouncement(announcement.id);
                      }}
                    >
                      Clear
                    </Button>
                    {expandedIds.includes(announcement.id) ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedIds.includes(announcement.id) && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-800">
                    <div 
                      className="text-sm text-gray-300 prose prose-invert max-w-none" 
                      dangerouslySetInnerHTML={{ __html: announcement.message }} 
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};