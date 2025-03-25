import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CourseService } from '../services/course.service';
import type { Course } from '../types';

export const useCourse = (courseId: string | undefined) => {
  const queryClient = useQueryClient();
  
  const normalizeId = (id: string | number | undefined): string | undefined => {
    if (id === undefined) return undefined;
    return id.toString();
  };
  
  const normalizedCourseId = normalizeId(courseId);

  const result = useQuery({
    queryKey: ['course', normalizedCourseId],
    queryFn: async () => {
      if (!normalizedCourseId) throw new Error('Course ID is required');
      
      // Try to get from courses cache first
      const courses = queryClient.getQueryData<Course[]>(['courses']);
      if (courses) {
        const course = courses.find(c => normalizeId(c.id) === normalizedCourseId);
        if (course) {
          console.log(`Course ${normalizedCourseId} found in courses cache`);
          
          // Prefetch assignments as individual queries for later access
          if (course.assignments) {
            course.assignments.forEach(assignment => {
              queryClient.setQueryData(
                ['assignment', normalizedCourseId, normalizeId(assignment.id)],
                assignment
              );
            });
          }
          return course;
        }
      }
      
      // Otherwise fetch from API
      console.log(`Fetching course ${normalizedCourseId} from API`);
      const courseDetails = await CourseService.getCourseDetails(normalizedCourseId);
      
      // Cache individual assignments for future use
      if (courseDetails.assignments) {
        courseDetails.assignments.forEach(assignment => {
          queryClient.setQueryData(
            ['assignment', normalizedCourseId, normalizeId(assignment.id)],
            assignment
          );
        });
      }
      
      return courseDetails;
    },
    enabled: !!normalizedCourseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    course: result.data,
    loading: result.isLoading,
    error: result.error ? 'Failed to load course details' : null,
  };
}; 