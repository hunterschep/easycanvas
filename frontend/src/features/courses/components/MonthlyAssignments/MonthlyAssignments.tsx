import { useNavigate } from 'react-router-dom';
import type { Assignment, FilterOptions } from '../../types';
import { groupAssignmentsByMonth } from '../../utils/assignment.utils';

interface MonthlyAssignmentsProps {
  assignments: Assignment[];
  courseId: number;
  filterOptions: FilterOptions;
}

export const MonthlyAssignments = ({ assignments, courseId, filterOptions }: MonthlyAssignmentsProps) => {
  const navigate = useNavigate();
  const groupedAssignments = groupAssignmentsByMonth(assignments, filterOptions);

  const getStatusColor = (assignment: Assignment) => {
    if (assignment.grade && assignment.grade !== 'N/A') {
      return 'text-purple-500';
    }
    if (assignment.due_at && new Date(assignment.due_at) < new Date()) {
      return 'text-yellow-500';
    }
    return 'text-blue-500';
  };

  const getStatusText = (assignment: Assignment) => {
    if (assignment.grade && assignment.grade !== 'N/A') {
      return `${assignment.grade}/${assignment.points_possible}`;
    }
    if (assignment.due_at && new Date(assignment.due_at) < new Date()) {
      return 'Not Yet Graded';
    }
    return 'Upcoming';
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedAssignments).map(([month, monthAssignments]) => (
        <div key={month} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black border border-gray-800 rounded-lg p-6">
            <details className="group" open={new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) === month}>
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <div className="flex items-center gap-2">
                  <svg 
                    className="w-4 h-4 transition-transform duration-200 group-open:rotate-90" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                  </svg>
                  <h2 className="text-xl font-bold">{month}</h2>
                </div>
                <span className="text-sm text-gray-400">
                  {monthAssignments.length} assignment{monthAssignments.length !== 1 ? 's' : ''}
                </span>
              </summary>
              <div className="mt-4 space-y-4">
                {monthAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    onClick={() => navigate(`/course/${courseId}/assignment/${assignment.id}`)}
                    className="block p-4 border border-gray-800 rounded-lg hover:border-gray-600 transition-all duration-200 cursor-pointer hover:bg-gray-900"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-medium text-white flex-grow">{assignment.name}</h3>
                        <span className={`text-sm font-medium whitespace-nowrap ${getStatusColor(assignment)}`}>
                          {getStatusText(assignment)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        {assignment.due_at && new Date(assignment.due_at).getFullYear() > 1970 && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Due: {new Date(assignment.due_at).toLocaleString('default', { 
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        )}
                        {assignment.submission_types && assignment.submission_types.length > 0 && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="capitalize">{assignment.submission_types.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      ))}
    </div>
  );
}; 