import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Assignment, Course } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

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
    
    const filteredAssignments = selectedCourseId === 'all' 
      ? assignments 
      : assignments.filter(a => a.course_id === selectedCourseId);

    return eachDayOfInterval({ start, end }).map((date: Date) => {
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

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg p-6">
        {/* Course Filter */}
        <div className="mb-4">
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
        </div>

        <div className="grid grid-cols-7 gap-px">
          {/* Calendar Header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm text-gray-400">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {calendar.map(({ date, assignments }: CalendarDay) => (
            <div
              key={date.toISOString()}
              className={`min-h-[100px] p-2 border border-gray-800 hover:border-gray-700 transition-colors ${
                isSameDay(date, new Date()) ? 'bg-gray-900/50' : ''
              }`}
            >
              <div className="text-sm text-gray-500 mb-2">
                {format(date, 'd')}
              </div>
              
              <div className="space-y-1">
                {assignments.map(assignment => {
                  const course = courses.find(c => c.id === assignment.course_id);
                  const isCompleted = completedAssignments.has(assignment.id);
                  
                  return (
                    <div
                      key={assignment.id}
                      onClick={() => navigate(`/course/${assignment.course_id}/assignment/${assignment.id}`)}
                      className="cursor-pointer group/item"
                    >
                      <div className={`
                        px-2 py-1 rounded text-xs truncate
                        ${getCourseColor(assignment.course_id)} bg-opacity-10
                        group-hover/item:bg-opacity-20 transition-all
                        ${isCompleted ? 'opacity-50' : ''}
                        flex items-center gap-2
                      `}>
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => toggleAssignment(e, assignment.id)}
                          className="h-3 w-3 rounded border-gray-600 bg-gray-900 checked:bg-green-500"
                        />
                        <div className={isCompleted ? 'line-through' : ''}>
                          <span className="text-white">{assignment.name}</span>
                          <span className="text-gray-400 text-xs block">
                            {course?.name}
                          </span>
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