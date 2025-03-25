import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CourseService } from '../services/course.service';
import type { Course } from '../types';

export const useCourses = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['courses'],
    queryFn: async ({ signal }) => {
      return CourseService.getCourses(false);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const refreshCourses = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      // Need to bypass the query to force a refresh
      const freshData = await CourseService.getCourses(true);
      queryClient.setQueryData(['courses'], freshData);
      return freshData;
    }
    return query.refetch();
  };

  return {
    courses: query.data || [],
    loading: query.isLoading,
    error: query.error ? 'Failed to load courses' : null,
    refreshCourses
  };
}; 