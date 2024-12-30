import { useState, useEffect } from 'react';
import { getUserCourses } from '../firebase/firestore';
import Account from './Account';
import Loading from './Loading';

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
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getUserCourses();
        setCourses(coursesData);
      } catch (err) {
        setError('Failed to load courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

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
                <h2 className="text-xl font-bold mb-4">Your Courses</h2>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
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