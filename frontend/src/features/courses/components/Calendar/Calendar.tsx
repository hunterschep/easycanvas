import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Assignment, Course } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, subDays, getDay } from 'date-fns';

interface CalendarProps {
  assignments: Assignment[];
  courses: Course[];
}

interface CalendarDay {
  date: Date;
  assignments: Assignment[];
}

export const Calendar = ({ assignments, courses }: CalendarProps) => {
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState<number | 'all'>('all');
  const [completedAssignments, setCompletedAssignments] = useState<Set<number>>(new Set());
  
  const calendar = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
  
    // Add all assignments with a submission to completedAssignments
    assignments.forEach(assignment => {
      if (assignment.has_submitted_submissions) {
        completedAssignments.add(assignment.id);
      }
    });

    // Adjust the start date to the previous Sunday
    const startDayOfWeek = getDay(start);
    const adjustedStart = startDayOfWeek === 0 ? start : subDays(start, startDayOfWeek);
    
    // Adjust the end date to the next Saturday
    const endDayOfWeek = getDay(end);
    const adjustedEnd = endDayOfWeek === 6 ? end : addDays(end, 6 - endDayOfWeek);
    
    const filteredAssignments = selectedCourseId === 'all' 
      ? assignments 
      : assignments.filter(a => a.course_id === selectedCourseId);

    return eachDayOfInterval({ start: adjustedStart, end: adjustedEnd }).map((date: Date) => {
      const dayAssignments = filteredAssignments.filter(assignment => 
        assignment.due_at && isSameDay(new Date(assignment.due_at), date)
      );
      
      return {
        date,
        assignments: dayAssignments
      };
    });
  }, [assignments, selectedCourseId]);

  const getCourseColor = (courseId: number) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500'
    ];
    return colors[courseId % colors.length];
  };

  const toggleAssignment = (e: React.MouseEvent | React.ChangeEvent, assignmentId: number) => {
    e.stopPropagation();
    setCompletedAssignments(prev => {
      const next = new Set(prev);
      if (next.has(assignmentId)) {
        next.delete(assignmentId);
      } else {
        next.add(assignmentId);
      }
      return next;
    });
  };

  const getHeaviestWorkloadDay = () => {
    let maxAssignments = 0;
    let heaviestDay: Date | null = null;

    calendar.forEach(({ date, assignments }) => {
      if (assignments.length > maxAssignments) {
        maxAssignments = assignments.length;
        heaviestDay = date;
      }
    });

    return heaviestDay;
  };

  const heaviestDay = getHeaviestWorkloadDay();

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-700"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            
            <button 
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-lg border border-gray-800 transition-colors flex items-center gap-2"
              onClick={() => console.log('Export to Google Calendar')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Export to Google Calendar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-800/20 rounded-lg overflow-hidden">
          {/* Week Header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-400 bg-gray-900/50">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {calendar.map(({ date, assignments }: CalendarDay) => (
            <div
              key={date.toISOString()}
              className={`
                min-h-[120px] p-2 bg-gray-900/30 hover:bg-gray-900/50 transition-colors relative
                ${isSameDay(date, new Date()) ? 'bg-gray-800/30 ring-1 ring-purple-500/30' : ''}
              `}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`
                  text-sm font-medium
                  ${isSameDay(date, new Date()) ? 'text-purple-400' : 'text-gray-500'}
                `}>
                  {format(date, 'd')}
                </span>
                {heaviestDay && isSameDay(date, heaviestDay) && (
                  <span className="text-yellow-500" title="Heaviest workload">
                    <p className="text-xl">⚠️</p>
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                {assignments.map(assignment => {
                  const course = courses.find(c => c.id === assignment.course_id);
                  const isCompleted = completedAssignments.has(assignment.id);
                  
                  return (
                    <div
                      key={assignment.id}
                      className="group/item relative"
                    >
                      <div className={`
                        p-2 rounded text-xs
                        ${getCourseColor(assignment.course_id)} bg-opacity-10
                        group-hover/item:bg-opacity-20 transition-all
                        ${isCompleted ? 'opacity-50' : ''}
                      `}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="flex-grow cursor-pointer"
                            onClick={() => navigate(`/course/${assignment.course_id}/assignment/${assignment.id}`)}
                          >
                            <span className={`text-white ${isCompleted ? 'line-through' : ''}`}>
                              {assignment.name}
                            </span>
                            <span className="text-gray-400 text-xs block">
                              {course?.name}
                            </span>
                          </div>
                          <button
                            onClick={(e) => toggleAssignment(e, assignment.id)}
                            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                          >
                            {isCompleted ? (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};