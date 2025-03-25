import { useNavigate } from 'react-router-dom';
import { Assignment } from '../../types';
import { useState } from 'react';

interface UpcomingAssignmentsProps {
  assignments: (Assignment & { course: string })[];
}

export const UpcomingAssignments = ({ assignments }: UpcomingAssignmentsProps) => {
  const navigate = useNavigate();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  // Sort assignments by due date (closest first)
  const sortedAssignments = [...assignments].sort((a, b) => 
    new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
  );

  // Calculate time remaining for each assignment
  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays < 0) return 'Past due';
    if (diffDays === 0 && diffHours < 6) return `${diffHours}h remaining`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `Due in ${diffDays} days`;
    return `Due in ${Math.floor(diffDays / 7)} weeks`;
  };

  // Function to determine priority level
  const getPriorityLevel = (dueDate: string, pointsPossible: number) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'past';
    if (diffDays === 0) return 'urgent';
    if (diffDays <= 2) return 'high';
    if (diffDays <= 7) return 'medium';
    return 'low';
  };

  // Function to get appropriate styles based on priority
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'past':
        return {
          border: 'border-red-900/70',
          bg: 'bg-red-900/10', 
          text: 'text-red-400',
          hover: 'hover:border-red-700/70 hover:bg-red-900/20'
        };
      case 'urgent':
        return {
          border: 'border-red-800/50',
          bg: 'bg-gradient-to-r from-red-900/10 to-black', 
          text: 'text-red-400',
          hover: 'hover:border-red-700 hover:from-red-900/20'
        };
      case 'high':
        return {
          border: 'border-orange-800/50',
          bg: 'bg-gradient-to-r from-orange-900/10 to-black', 
          text: 'text-orange-400',
          hover: 'hover:border-orange-700 hover:from-orange-900/20'
        };
      case 'medium':
        return {
          border: 'border-yellow-800/50',
          bg: 'bg-gradient-to-r from-yellow-900/10 to-black', 
          text: 'text-yellow-400',
          hover: 'hover:border-yellow-700 hover:from-yellow-900/20'
        };
      case 'low':
      default:
        return {
          border: 'border-green-800/50',
          bg: 'bg-gradient-to-r from-green-900/10 to-black', 
          text: 'text-green-400',
          hover: 'hover:border-green-700 hover:from-green-900/20'
        };
    }
  };
  
  return (
    <div className="relative group flex-1">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Upcoming Assignments</h2>
          <div className="flex space-x-2">
            <div className="flex items-center text-xs">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
              <span className="text-gray-400">Urgent</span>
            </div>
            <div className="flex items-center text-xs">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
              <span className="text-gray-400">Soon</span>
            </div>
            <div className="flex items-center text-xs">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
              <span className="text-gray-400">Later</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
          {sortedAssignments.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p>No upcoming assignments!</p>
              <p className="text-sm mt-2">Enjoy your free time.</p>
            </div>
          ) : (
            sortedAssignments.map((assignment, index) => {
              const priority = getPriorityLevel(assignment.due_at, assignment.points_possible);
              const styles = getPriorityStyles(priority);
              const timeRemaining = getTimeRemaining(assignment.due_at);
              
              return (
                <div
                  key={assignment.id}
                  onClick={() => navigate(`/course/${assignment.course_id}/assignment/${assignment.id}`)}
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className={`p-4 border ${styles.border} rounded-lg ${styles.bg} ${styles.hover} transition-all duration-300 cursor-pointer transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/50`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <h3 className="font-medium text-white">{assignment.name}</h3>
                      <div className="flex items-center mt-1 text-sm">
                        <span className="text-gray-400 mr-2">{assignment.course}</span>
                        {assignment.points_possible > 0 && (
                          <span className="px-1.5 py-0.5 text-xs rounded bg-black/50 text-gray-300 border border-gray-800">
                            {assignment.points_possible} pts
                          </span>
                        )}
                      </div>
                      
                      {hoverIndex === index && (
                        <div className="mt-3 text-sm text-gray-500 animate-fadeIn">
                          <div className="p-2 bg-black/70 border border-gray-800 rounded">
                            {assignment.submission_types && (
                              <div className="mb-1">
                                <span className="text-gray-400">Submit via:</span> {assignment.submission_types.join(', ')}
                              </div>
                            )}
                            {assignment.has_submitted_submissions && (
                              <span className="text-green-500">✓ Submitted</span>
                            )}
                            {!assignment.has_submitted_submissions && (
                              <span className="text-yellow-500">⚠ Not submitted yet</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end min-w-[100px]">
                      <span className={`text-sm ${styles.text} font-medium`}>
                        {timeRemaining}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {new Date(assignment.due_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};