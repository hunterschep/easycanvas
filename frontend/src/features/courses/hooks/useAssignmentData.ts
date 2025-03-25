import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCourse } from './useCourse';
import { useAssignment } from './useAssignment';
import type { Assignment } from '../types';
import { logInfo, logError } from '@/utils/debug';

/**
 * This hook combines multiple data sources to ensure we get the assignment data
 * from the best available source without making redundant API calls
 */
export const useAssignmentData = (courseId: string | undefined, assignmentId: string | undefined) => {
  const queryClient = useQueryClient();
  const { course, loading: courseLoading } = useCourse(courseId);
  const { assignment, loading: assignmentLoading, error: assignmentError } = useAssignment(courseId, assignmentId);

  const normalizeId = (id: string | number | undefined): string | undefined => {
    if (id === undefined) return undefined;
    return id.toString();
  };

  // When the course loads, cache all its assignments
  useEffect(() => {
    if (course?.assignments && courseId) {
      const normalizedCourseId = normalizeId(courseId);
      logInfo(`Caching ${course.assignments.length} assignments from course ${normalizedCourseId}`);
      
      course.assignments.forEach(assignment => {
        const normalizedAssignmentId = normalizeId(assignment.id);
        queryClient.setQueryData(
          ['assignment', normalizedCourseId, normalizedAssignmentId],
          assignment
        );
      });
    }
  }, [course, courseId, queryClient]);

  // Handle errors better by providing a fallback from the course data
  const getAssignmentFromCourse = (): Assignment | undefined => {
    if (!course?.assignments || !assignmentId) return undefined;
    
    const normalizedAssignmentId = normalizeId(assignmentId);
    return course.assignments.find(a => normalizeId(a.id) === normalizedAssignmentId);
  };

  // If the assignment failed but we have it in the course data, use that
  useEffect(() => {
    if (assignmentError && courseId && assignmentId) {
      const fallbackAssignment = getAssignmentFromCourse();
      if (fallbackAssignment) {
        logInfo('Using fallback assignment from course data', fallbackAssignment);
        queryClient.setQueryData(
          ['assignment', normalizeId(courseId), normalizeId(assignmentId)],
          fallbackAssignment
        );
      }
    }
  }, [assignmentError, course, courseId, assignmentId, queryClient]);

  return {
    assignment: assignment || getAssignmentFromCourse(),
    loading: courseLoading || assignmentLoading,
    error: assignmentError && !getAssignmentFromCourse() ? 'Failed to load assignment' : null,
  };
}; 