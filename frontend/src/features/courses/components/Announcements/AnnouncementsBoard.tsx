import { useAnnouncements } from '../../hooks/useAnnouncements';
import { Course } from '../../types';
import { Button } from '@/components/common/Button/Button';

interface AnnouncementsBoardProps {
  courses: Course[];
  onRefresh: () => void;
}

export const AnnouncementsBoard = ({ courses, onRefresh }: AnnouncementsBoardProps) => {
  const announcements = useAnnouncements(courses);

  const handleClearAnnouncement = async (announcementId: number) => {
    // TODO: Implement clear announcement functionality
    console.log('Clear announcement:', announcementId);
    onRefresh();
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg p-6">
        <div className="max-h-[400px] overflow-y-auto space-y-4">
          {announcements.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No announcements to display</p>
          ) : (
            announcements.map((announcement) => (
              <div 
                key={announcement.id} 
                className="border border-gray-800 rounded-lg p-4 space-y-3 hover:border-gray-600 transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 flex-grow">
                    <h3 className="font-medium text-white">{announcement.title}</h3>
                    <p className="text-sm text-gray-400">{announcement.courseName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => window.open(announcement.html_url, '_blank')}
                    >
                      View in Canvas
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleClearAnnouncement(announcement.id)}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-300" 
                  dangerouslySetInnerHTML={{ __html: announcement.message }} 
                />
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    {announcement.author && (
                      <>
                        <img 
                          src={announcement.author.avatar_url} 
                          alt={announcement.author.display_name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{announcement.author.display_name}</span>
                      </>
                    )}
                  </div>
                  <span>
                    Posted: {new Date(announcement.posted_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};