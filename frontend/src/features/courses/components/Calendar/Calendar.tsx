import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Assignment, Course } from '../../types';
import { 
  format, 
  startOfDay, 
  addDays, 
  subDays, 
  getDay, 
  isSameDay, 
  startOfWeek,
  addWeeks,
  subWeeks,
  isWithinInterval
} from 'date-fns';

interface CalendarProps {
  assignments: Assignment[];
  courses: Course[];
}

interface CalendarDay {
  date: Date;
  assignments: Assignment[];
  isCurrentPeriod: boolean;
}

export const Calendar = ({ assignments, courses }: CalendarProps) => {
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState<number | 'all'>('all');
  const [completedAssignments, setCompletedAssignments] = useState<Set<number>>(new Set());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const calendar = useMemo(() => {
    // Initialize completedAssignments with assignments that have submissions
    const completed = new Set<number>();
    assignments.forEach(assignment => {
      if (assignment.has_submitted_submissions) {
        completed.add(assignment.id);
      }
    });
    setCompletedAssignments(completed);

    // Get the dates for our 3-week view
    const today = new Date();
    const startDate = subWeeks(startOfWeek(currentDate, { weekStartsOn: 0 }), 1);
    const endDate = addDays(startDate, 27); // 3 weeks = 21 days
    
    // Filter assignments based on selected course
    const filteredAssignments = selectedCourseId === 'all' 
      ? assignments 
      : assignments.filter(a => a.course_id === selectedCourseId);

    // Generate calendar days
    const days: CalendarDay[] = [];
    let currentDay = startDate;
    
    while (currentDay <= endDate) {
      const dayAssignments = filteredAssignments.filter(assignment => 
        assignment.due_at && isSameDay(new Date(assignment.due_at), currentDay)
      );
      
      // Check if the day is within our target period (1 week behind to 2 weeks ahead)
      const oneWeekBehind = subWeeks(today, 1);
      const threeWeeksAhead = addWeeks(today, 3);
      const isCurrentPeriod = isWithinInterval(currentDay, { 
        start: startOfDay(oneWeekBehind), 
        end: startOfDay(threeWeeksAhead) 
      });
      
      days.push({
        date: currentDay,
        assignments: dayAssignments,
        isCurrentPeriod
      });
      
      currentDay = addDays(currentDay, 1);
    }
    
    return days;
  }, [assignments, selectedCourseId, currentDate]);

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

  const navigatePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const navigateNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const resetToCurrentWeek = () => {
    setCurrentDate(new Date());
  };

  // Group days by week for better display
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < calendar.length; i += 7) {
      result.push(calendar.slice(i, i + 7));
    }
    return result;
  }, [calendar]);

  return (
    <div className="relative group flex-1">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg h-full flex flex-col overflow-hidden">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 w-full sm:w-auto mb-3 sm:mb-0">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gray-700 w-full"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            
            <button 
              className="px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-lg border border-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
              onClick={() => console.log('Export to Google Calendar')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <button 
                onClick={navigatePreviousWeek} 
                className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 transition-colors text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={resetToCurrentWeek}
                className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 transition-colors text-white text-sm font-medium"
              >
                Today
              </button>
              
              <button 
                onClick={navigateNextWeek} 
                className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 transition-colors text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="text-white font-medium ml-4">
              {format(weeks[0][0].date, 'MMM yyyy')}
            </div>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="overflow-auto flex-1">
          <div className="min-w-[768px] h-full flex flex-col">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 bg-black">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-400 border-b border-gray-800">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Weeks */}
            <div className="divide-y divide-gray-800 flex-1 flex flex-col">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 flex-1 min-h-[150px]">
                  {week.map(({ date, assignments, isCurrentPeriod }) => {
                    const isToday = isSameDay(date, new Date());
                    
                    return (
                      <div
                        key={date.toISOString()}
                        className={`
                          p-2 border-r border-gray-800 last:border-r-0
                          transition-colors h-full flex flex-col
                          ${isCurrentPeriod ? 'bg-black' : 'bg-black/90 opacity-70'}
                          ${isToday ? 'ring-1 ring-inset ring-white/30' : ''}
                          hover:bg-gray-900/30
                        `}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`
                            text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center
                            ${isToday ? 'bg-white text-black' : 'text-gray-400'}
                          `}>
                            {format(date, 'd')}
                          </span>
                        </div>
                        
                        <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1">
                          {assignments.map(assignment => {
                            const course = courses.find(c => c.id === assignment.course_id);
                            const isCompleted = completedAssignments.has(assignment.id);
                            
                            return (
                              <div
                                key={assignment.id}
                                className="group/assignment relative"
                              >
                                <div className={`
                                  p-1.5 rounded text-xs
                                  bg-gradient-to-r bg-gray-700
                                  hover:brightness-110 transition-all
                                  ${isCompleted ? 'opacity-40' : ''}
                                `}>
                                  <div className="flex items-center gap-1.5">
                                    <div 
                                      className="flex-grow cursor-pointer truncate"
                                      onClick={() => navigate(`/course/${assignment.course_id}/assignment/${assignment.id}`)}
                                    >
                                      <span className={`text-white ${isCompleted ? 'line-through' : ''} text-xs truncate block`}>
                                        {assignment.name}
                                      </span>
                                      <span className="text-gray-200 text-[10px] truncate block">
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
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};