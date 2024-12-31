import { useNavigate } from 'react-router-dom';
import { Assignment } from '../../types';

interface UpcomingAssignmentsProps {
  assignments: (Assignment & { course: string })[];
}

export const UpcomingAssignments = ({ assignments }: UpcomingAssignmentsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Assignments</h2>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              onClick={() => navigate(`/course/${assignment.course_id}/assignment/${assignment.id}`)}
              className="p-4 border border-gray-800 rounded-lg hover:border-gray-600 transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{assignment.name}</h3>
                  <p className="text-sm text-gray-400">{assignment.course}</p>
                </div>
                <span className="text-sm text-gray-400">
                  Due: {new Date(assignment.due_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 