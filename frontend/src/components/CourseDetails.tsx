// frontend/src/components/CourseDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Account from './Account';
import Loading from './Loading';

interface Assignment {
  id: number;
  name: string;
  description: string | null;
  due_at: string;
  points_possible: number;
  html_url: string;
  submission_types: string[];
}

interface Course {
  id: number;
  name: string;
  code: string;
  assignments: Assignment[];
  start_at: string | null;
  end_at: string | null;
  time_zone: string;
}

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // Reuse the existing courses data from localStorage or state management
        const coursesData = JSON.parse(localStorage.getItem('coursesData') || '[]');
        const foundCourse = coursesData.find((c: Course) => c.id === Number(courseId));
        
        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          // Handle course not found
          navigate('/home');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, navigate]);

  if (loading) {
    return <Loading message="Loading course details..." />;
  }

  if (!course) {
    return null;
  }

  // Sort assignments by due date
  const sortedAssignments = [...course.assignments].sort((a, b) => {
    if (!a.due_at) return 1;
    if (!b.due_at) return -1;
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-all duration-200"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-black tracking-tighter">
                easy<span className="text-gray-500">canvas</span>
              </h1>
            </div>
            <Account />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
          <p className="text-gray-400">{course.code}</p>
        </div>

        {/* Course Content */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Assignments</h2>
            <div className="space-y-4">
              {sortedAssignments.map((assignment) => (
                <a
                  key={assignment.id}
                  href={assignment.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-gray-800 rounded-lg hover:border-gray-600 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium mb-1">{assignment.name}</h3>
                      <p className="text-sm text-gray-400">
                        Points: {assignment.points_possible}
                      </p>
                      {assignment.submission_types && (
                        <p className="text-sm text-gray-400">
                          Type: {assignment.submission_types.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-400">
                        {assignment.due_at
                          ? `Due: ${new Date(assignment.due_at).toLocaleDateString()}`
                          : 'No due date'}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;