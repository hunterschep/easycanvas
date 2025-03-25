import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CourseService } from '../services/course.service';
import type { Assignment, Course } from '../types';
import { logCache, logInfo, logError } from '@/utils/debug';

export const useAssignment = (courseId: string | undefined, assignmentId: string | undefined) => {
  const queryClient = useQueryClient();

  const normalizeId = (id: string | number | undefined): string | undefined => {
    if (id === undefined) return undefined;
    return id.toString();
  };

  const normalizedCourseId = normalizeId(courseId);
  const normalizedAssignmentId = normalizeId(assignmentId);

  logInfo(`Using assignment hook with courseId=${normalizedCourseId}, assignmentId=${normalizedAssignmentId}`);

  const result = useQuery({
    queryKey: ['assignment', normalizedCourseId, normalizedAssignmentId],
    queryFn: async () => {
      if (!normalizedCourseId || !normalizedAssignmentId) 
        throw new Error('Course ID and Assignment ID are required');
      
      // First check courses cache
      const allCourses = queryClient.getQueryData<Course[]>(['courses']);
      if (allCourses) {
        logCache('All courses from cache', allCourses);
        const course = allCourses.find(c => normalizeId(c.id) === normalizedCourseId);
        
        if (course?.assignments) {
          const assignmentFromCourse = course.assignments.find(
            a => normalizeId(a.id) === normalizedAssignmentId
          );
          
          if (assignmentFromCourse) {
            logInfo(`Assignment ${normalizedAssignmentId} found in courses cache`);
            // Store in assignment cache for future use
            queryClient.setQueryData(
              ['assignment', normalizedCourseId, normalizedAssignmentId], 
              assignmentFromCourse
            );
            return assignmentFromCourse;
          }
        }
      }

      // Next, check single course cache
      const course = queryClient.getQueryData<Course>(['course', normalizedCourseId]);
      if (course?.assignments) {
        logCache(`Course ${normalizedCourseId} from cache`, course);
        const assignmentFromCourse = course.assignments.find(
          a => normalizeId(a.id) === normalizedAssignmentId
        );
        
        if (assignmentFromCourse) {
          logInfo(`Assignment ${normalizedAssignmentId} found in course details cache`);
          // Store in assignment cache for future use
          queryClient.setQueryData(
            ['assignment', normalizedCourseId, normalizedAssignmentId], 
            assignmentFromCourse
          );
          return assignmentFromCourse;
        }
      }

      // Last, try direct assignment cache
      const cachedAssignment = queryClient.getQueryData<Assignment>(
        ['assignment', normalizedCourseId, normalizedAssignmentId]
      );
      
      if (cachedAssignment) {
        logInfo(`Assignment ${normalizedAssignmentId} found in direct assignment cache`);
        return cachedAssignment;
      }
      
      // Only if not found in any cache, fetch from API
      logInfo(`Fetching assignment ${normalizedAssignmentId} for course ${normalizedCourseId} from API`);
      try {
        return await CourseService.getAssignment(normalizedCourseId, normalizedAssignmentId);
      } catch (error) {
        logError(`Failed to fetch assignment ${normalizedAssignmentId}`, error);
        throw error;
      }
    },
    enabled: !!normalizedCourseId && !!normalizedAssignmentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    assignment: result.data,
    loading: result.isLoading,
    error: result.error ? 'Failed to load assignment' : null,
  };
}; 