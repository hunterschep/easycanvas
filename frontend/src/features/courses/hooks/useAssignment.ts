import { useState, useEffect } from 'react';
import { CourseService } from '../services/course.service';
import type { Assignment, Course } from '../types';

export const useAssignment = (courseId: string | undefined, assignmentId: string | undefined) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!courseId || !assignmentId) return;
      
      try {
        setLoading(true);
        
        // First try to get the assignment from cached courses
        const cachedCoursesData = localStorage.getItem('coursesData');
        if (cachedCoursesData) {
          const courses = JSON.parse(cachedCoursesData);
          const course = courses.find((c: Course) => c.id.toString() === courseId.toString());
          if (course && course.assignments) {
            const cachedAssignment = course.assignments.find(
              (a: Assignment) => a.id.toString() === assignmentId.toString()
            );
            if (cachedAssignment) {
              setAssignment(cachedAssignment);
              setLoading(false);
              return;
            }
          }
        }

        // If not in cache, fetch from API
        const data = await CourseService.getAssignment(courseId, assignmentId);
        setAssignment(data);
      } catch (err) {
        setError('Failed to load assignment');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [courseId, assignmentId]);

  return { assignment, loading, error };
}; 