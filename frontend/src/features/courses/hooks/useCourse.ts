import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CourseService } from '../services/course.service';
import type { CanvasCourse, CanvasAssignment } from '@/types/canvas.types';
import { useAuth } from '@/features/auth/context/AuthContext';

export const useCourse = (courseId: string | undefined) => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  const normalizeId = (id: string | number | undefined): string | undefined => {
    if (id === undefined) return undefined;
    return id.toString();
  };
  
  const normalizedCourseId = normalizeId(courseId);

  const result = useQuery({
    queryKey: ['course', currentUser?.uid, normalizedCourseId],
    queryFn: async () => {
      if (!normalizedCourseId) throw new Error('Course ID is required');
      
      // Try to get from courses cache first
      const courses = queryClient.getQueryData<CanvasCourse[]>(['courses', currentUser?.uid]);
      if (courses) {
        const course = courses.find(c => normalizeId(c.id) === normalizedCourseId);
        if (course) {
          console.log(`Course ${normalizedCourseId} found in courses cache`);
          
          // Prefetch assignments as individual queries for later access
          if (course.assignments) {
            course.assignments.forEach((assignment: CanvasAssignment) => {
              queryClient.setQueryData(
                ['assignment', currentUser?.uid, normalizedCourseId, normalizeId(assignment.id)],
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
        courseDetails.assignments.forEach((assignment: CanvasAssignment) => {
          queryClient.setQueryData(
            ['assignment', currentUser?.uid, normalizedCourseId, normalizeId(assignment.id)],
            assignment
          );
        });
      }
      
      return courseDetails;
    },
    enabled: !!normalizedCourseId && !!currentUser,
  });

  return {
    course: result.data,
    loading: result.isLoading,
    error: result.error ? 'Failed to load course details' : null,
  };
}; 