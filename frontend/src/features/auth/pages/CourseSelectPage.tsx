import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from '@/components/common/Loading';
import { CourseService } from '@/features/courses/services/course.service';
import { useAuth } from '../context/AuthContext';
import type { CourseBase } from '@/types/canvas.types';

export const CourseSelectPage = () => {
  const [availableCourses, setAvailableCourses] = useState<CourseBase[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      if (authLoading) return; // Wait for auth to be ready
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const courses = await CourseService.getAvailableCourses();
        console.log('Fetched courses:', courses);
        setAvailableCourses(courses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to fetch courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [authLoading, currentUser, navigate]);

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
      setLoading(true);
      await CourseService.saveSelectedCourses(selectedCourseIds);
      
      // Force a fresh fetch of all course data for the selected courses before
      // redirecting to ensure data is ready for the home page
      console.log("Selected courses saved, initiating full data fetch...");
      await CourseService.getCourses(true);
      
      navigate('/home');
    } catch (err) {
      console.error('Error saving courses:', err);
      setError('Failed to save course selection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Fetching your courses..." />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative max-w-3xl w-full">
        <div className="relative bg-black rounded-xl border border-gray-800 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">
              Select Your Courses
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              Choose the courses you want to track. We'll fetch assignments and updates for your selected courses.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Course Selection */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {availableCourses.map(course => (
              <div
                key={course.id}
                onClick={() => handleCourseToggle(course.id)}
                className={`group relative p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedCourseIds.includes(course.id)
                    ? 'border-white bg-white/5'
                    : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                {/* Checkbox indicator */}
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border rounded transition-all duration-200 flex items-center justify-center ${
                  selectedCourseIds.includes(course.id)
                    ? 'border-white bg-white'
                    : 'border-gray-600 group-hover:border-gray-400'
                }`}>
                  {selectedCourseIds.includes(course.id) && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <h3 className="font-medium text-white text-lg mb-1">{course.name}</h3>
                <p className="text-sm text-gray-400">{course.code}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 space-y-4">
            <button
              onClick={handleSubmit}
              disabled={selectedCourseIds.length === 0}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedCourseIds.length > 0
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedCourseIds.length > 0
                ? `Continue with ${selectedCourseIds.length} course${selectedCourseIds.length === 1 ? '' : 's'}`
                : 'Select at least one course to continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 