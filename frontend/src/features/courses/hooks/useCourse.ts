import { useState, useEffect } from 'react';
import { CourseService } from '../services/course.service';
import type { Course } from '../types';

export const useCourse = (courseId: string | undefined) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        
        // First try to get the course from cached courses
        const cachedCoursesData = localStorage.getItem('coursesData');
        if (cachedCoursesData) {
          const courses = JSON.parse(cachedCoursesData);
          const cachedCourse = courses.find((c: Course) => c.id.toString() === courseId.toString());
          if (cachedCourse) {
            setCourse(cachedCourse);
            setLoading(false);
            return;
          }
        }

        // If not in cache, fetch from API
        const data = await CourseService.getCourseDetails(courseId);
        setCourse(data);
      } catch (err) {
        setError('Failed to load course');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  return { course, loading, error };
}; 