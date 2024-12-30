import { useState, useEffect } from 'react';
import { getUserCourses } from '../firebase/firestore';
import Account from './Account';
import Loading from './Loading';
import { useNavigate } from 'react-router-dom';


interface Assignment {
  id: number;
  name: string;
  due_at: string;
  points_possible: number;
}

interface Course {
  id: number;
  name: string;
  code: string;
  assignments: Assignment[];
}

const Home = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const fetchCourses = async (forceRefresh: boolean = false) => {
    try {
      setRefreshing(forceRefresh);
      const coursesData = await getUserCourses(forceRefresh);
      setCourses(coursesData);
      localStorage.setItem('coursesData', JSON.stringify(coursesData));
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return <Loading message="Loading your courses..." />;
  }

  // Get upcoming assignments across all courses
  const upcomingAssignments = courses
    .flatMap(course => 
      course.assignments.map(assignment => ({
        ...assignment,
        course: course.name
      }))
    )
    .filter(assignment => new Date(assignment.due_at) > new Date())
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
    .slice(0, 5); // Show only next 5 assignments

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tighter">
              easy<span className="text-gray-500">canvas</span>
            </h1>
            <Account />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Assignments Section */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Upcoming Assignments</h2>
                <div className="space-y-4">
                  {upcomingAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 border border-gray-800 rounded-lg hover:border-gray-600 transition-all duration-200"
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
          </div>

          {/* Courses Section */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black border border-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Your Courses</h2>
                  <button
                    onClick={() => fetchCourses(true)}
                    disabled={refreshing}
                    className="px-3 py-1 text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    {refreshing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Refresh
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="p-4 border border-gray-800 rounded-lg hover:border-gray-600 transition-all duration-200 cursor-pointer"
                    >
                      <h3 className="font-medium">{course.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;