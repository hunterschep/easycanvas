import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Assignment, Course } from '../../types';
import { getCourseColorClass, getCourseColorPalette } from '../../utils/courseColors';
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
  isWithinInterval,
  isToday as isTodayFn,
  isFuture,
  isPast,
  differenceInDays
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
  const [hoveredAssignment, setHoveredAssignment] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  
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
    const endDate = addDays(startDate, 27); // 3 weeks = 21 days + extra week
    
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

  // Calculate counts and priorities
  const calendarStats = useMemo(() => {
    const totalDueThisWeek = assignments.filter(a => {
      if (!a.due_at) return false;
      const dueDate = new Date(a.due_at);
      const today = new Date();
      const oneWeekLater = addWeeks(today, 1);
      return isWithinInterval(dueDate, { start: today, end: oneWeekLater });
    }).length;

    const overdue = assignments.filter(a => {
      if (!a.due_at) return false;
      const dueDate = new Date(a.due_at);
      return isPast(dueDate) && !isSameDay(dueDate, new Date()) && !a.has_submitted_submissions;
    }).length;

    return { totalDueThisWeek, overdue };
  }, [assignments]);

  // Function to get color based on date proximity
  const getDateColor = (date: Date) => {
    if (isTodayFn(date)) return 'bg-white text-black';
    
    const daysDiff = differenceInDays(date, new Date());
    
    if (daysDiff < 0) return 'text-gray-500'; // Past
    if (daysDiff === 0) return 'text-white'; // Today 
    if (daysDiff === 1) return 'text-purple-300'; // Tomorrow
    if (daysDiff < 3) return 'text-blue-300'; // Soon
    
    return 'text-gray-400'; // Future
  };

  // Function to get appropriate color for assignment based on due date
  const getAssignmentColor = (dueDate: string, course: Course | undefined) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysDiff = differenceInDays(due, now);
    
    // If we're overdue, use the urgency color regardless of course
    if (daysDiff < 0) return 'from-red-900/40 to-red-900/20 border-red-900/50'; // Overdue
    if (daysDiff === 0) return 'from-purple-900/40 to-purple-900/20 border-purple-900/50'; // Due today
    if (daysDiff === 1) return 'from-orange-900/40 to-orange-900/20 border-orange-900/50'; // Due tomorrow
    
    // For assignments further in the future, use the course color
    if (course) {
      const palette = getCourseColorPalette(course);
      return `${palette.gradient} ${palette.border}`;
    }
    
    // Fallback for assignments without a course or far in the future
    if (daysDiff < 3) return 'from-yellow-900/40 to-yellow-900/20 border-yellow-900/50'; // Coming up soon
    return 'from-blue-900/40 to-blue-900/20 border-blue-900/50'; // Future
  };

  return (
    <div className="relative group flex-1">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg h-full flex flex-col overflow-hidden">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900/50 to-black">
          <div className="flex items-center gap-3 w-full sm:w-auto mb-3 sm:mb-0">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gray-700 w-full hover:border-gray-700 transition-colors"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            
            <button 
              className="px-3 py-2 bg-black hover:bg-gray-900 text-white text-sm rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 flex items-center gap-2 whitespace-nowrap transform hover:translate-y-[-1px]"
              onClick={() => console.log('Export to Google Calendar')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={navigatePreviousWeek} 
                className="p-2 rounded-lg bg-black hover:bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 text-white transform hover:translate-y-[-1px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={resetToCurrentWeek}
                className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-300 text-white text-sm font-medium transform hover:translate-y-[-1px]"
              >
                Today
              </button>
              
              <button 
                onClick={navigateNextWeek} 
                className="p-2 rounded-lg bg-black hover:bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 text-white transform hover:translate-y-[-1px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="text-white font-medium">
              {format(weeks[0][0].date, 'MMM yyyy')}
            </div>
          </div>
        </div>

        {/* Calendar Stats - New Section */}
        <div className="flex justify-between items-center p-3 bg-black border-b border-gray-800 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-400">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-400">Tomorrow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-400">Overdue</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-2 py-1 rounded bg-gray-900 text-xs">
              <span className="text-white font-medium">{calendarStats.totalDueThisWeek}</span>
              <span className="text-gray-400 ml-1">due this week</span>
            </div>
            {calendarStats.overdue > 0 && (
              <div className="px-2 py-1 rounded bg-red-900/30 border border-red-900/50 text-xs">
                <span className="text-red-400 font-medium">{calendarStats.overdue}</span>
                <span className="text-gray-400 ml-1">overdue</span>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Body */}
        <div className="overflow-auto flex-1 custom-scrollbar">
          <div className="min-w-[768px] h-full flex flex-col">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 bg-gradient-to-r from-gray-900/30 to-black sticky top-0 z-10">
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
                    const isToday = isTodayFn(date);
                    const dateColor = getDateColor(date);
                    
                    return (
                      <div
                        key={date.toISOString()}
                        className={`
                          p-2 border-r border-gray-800 last:border-r-0
                          transition-all duration-300 h-full flex flex-col
                          ${isCurrentPeriod ? 'bg-black' : 'bg-black/90 opacity-60'}
                          ${isToday ? 'ring-1 ring-inset ring-purple-500/50 bg-purple-900/5' : ''}
                          ${hoveredDay && isSameDay(hoveredDay, date) ? 'bg-gray-900/40' : 'hover:bg-gray-900/20'}
                        `}
                        onMouseEnter={() => setHoveredDay(date)}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`
                            text-sm font-medium rounded-full w-7 h-7 flex items-center justify-center
                            transition-all duration-300
                            ${isToday ? 'bg-purple-500 text-white' : dateColor}
                            ${hoveredDay && isSameDay(hoveredDay, date) ? 'scale-110' : ''}
                          `}>
                            {format(date, 'd')}
                          </span>
                          {assignments.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-900 text-gray-400 border border-gray-800">
                              {assignments.length}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-0.5">
                          {assignments.map(assignment => {
                            const course = courses.find(c => c.id === assignment.course_id);
                            const isCompleted = completedAssignments.has(assignment.id);
                            const assignmentColor = getAssignmentColor(assignment.due_at, course);
                            const isHovered = hoveredAssignment === assignment.id;
                            
                            return (
                              <div
                                key={assignment.id}
                                className="group/assignment relative"
                                onMouseEnter={() => setHoveredAssignment(assignment.id)}
                                onMouseLeave={() => setHoveredAssignment(null)}
                              >
                                <div className={`
                                  p-1.5 rounded text-xs
                                  bg-gradient-to-r ${assignmentColor}
                                  hover:brightness-110 transition-all duration-300 border
                                  ${isHovered ? 'translate-y-[-1px] shadow-lg shadow-black/50' : ''}
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
                                      {course && (
                                        <span className={`text-[10px] truncate block ${getCourseColorClass(course, 'text')}`}>
                                          {course.name}
                                        </span>
                                      )}
                                      
                                      {isHovered && assignment.points_possible > 0 && (
                                        <span className="text-[10px] text-gray-400 mt-1 bg-black/50 px-1 py-0.5 rounded inline-block">
                                          {assignment.points_possible} pts
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={(e) => toggleAssignment(e, assignment.id)}
                                      className="p-1.5 rounded-full hover:bg-black/30 transition-colors"
                                    >
                                      {isCompleted ? (
                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      ) : (
                                        <svg className="w-4 h-4 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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