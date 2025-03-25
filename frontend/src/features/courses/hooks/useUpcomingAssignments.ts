import { useMemo } from 'react';
import type { Course, Assignment } from '../types';

export const useUpcomingAssignments = (courses: Course[], limit: number = 5) => {
  return useMemo(() => {
    return courses
      .flatMap(course => 
        course.assignments.map(assignment => ({
          ...assignment,
          course: course.name,
          courseObj: course
        }))
      )
      .filter(assignment => new Date(assignment.due_at) > new Date())
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
      .slice(0, limit);
  }, [courses, limit]);
}; 