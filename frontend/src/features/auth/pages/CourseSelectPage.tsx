import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from '@/components/common/Loading';
import { CourseService } from '@/features/courses/services/course.service';
import type { CourseBase } from '@/features/courses/types';

export const CourseSelectPage = () => {
  const [availableCourses, setAvailableCourses] = useState<CourseBase[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await CourseService.getAvailableCourses();
        setAvailableCourses(courses);
      } catch (err) {
        setError('Failed to fetch courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseToggle = (courseId: number) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async () => {
    if (selectedCourseIds.length === 0) {
      setError('Please select at least one course');
      return;
    }

    try {
      await CourseService.saveSelectedCourses(selectedCourseIds);
      navigate('/home');
    } catch (err) {
      setError('Failed to save course selection. Please try again.');
    }
  };

  if (loading) {
    return <Loading message="Fetching your courses..." />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Background gradient effects */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative group max-w-2xl w-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-black rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-2">
              Select Your Courses
            </h1>
            <p className="text-sm text-gray-400">Choose the courses you're currently enrolled in</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {availableCourses.map(course => (
              <div
                key={course.id}
                onClick={() => handleCourseToggle(course.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedCourseIds.includes(course.id)
                    ? 'border-white bg-gray-900'
                    : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <h3 className="font-medium text-white">{course.name}</h3>
                <p className="text-sm text-gray-400">{course.code}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 