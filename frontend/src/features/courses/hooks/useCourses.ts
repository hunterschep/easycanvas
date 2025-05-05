import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CourseService } from '../services/course.service';
import type { CanvasCourse } from '@/types/canvas.types';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';

export const useCourses = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  // Clean up cache if no user is logged in
  useEffect(() => {
    if (!currentUser) {
      queryClient.removeQueries({ queryKey: ['courses'] });
    }
  }, [currentUser, queryClient]);
  
  const query = useQuery({
    queryKey: ['courses'],
    queryFn: async ({ signal }) => {
      try {
        return await CourseService.getCourses(false);
      } catch (error) {
        // If we get an error, it might be because the courses don't exist yet
        console.log("Error in initial courses fetch, attempting force refresh:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!currentUser, // Only run the query if there's a logged-in user
  });

  // Effect to handle the case of a new user who has just created their account
  // and selected courses, but doesn't have course data fetched yet
  useEffect(() => {
    const checkAndFetchInitialData = async () => {
      // If we have an empty array, this might be a new user
      if (currentUser && query.data && query.data.length === 0 && !query.isFetching) {
        console.log("No courses found - likely a new user. Forcing a refresh.");
        refreshCourses(true);
      }
    };

    checkAndFetchInitialData();
  }, [query.data, query.isFetching, currentUser]);
  
  const refreshCourses = async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) {
        console.log("Forcing a full course refresh from Canvas");
        // Need to bypass the query to force a refresh
        const freshData = await CourseService.getCourses(true);
        queryClient.setQueryData(['courses'], freshData);
        return freshData;
      }
      return query.refetch();
    } catch (error) {
      console.error("Error refreshing courses:", error);
      throw error;
    }
  };

  const clearCoursesCache = () => {
    queryClient.removeQueries({ queryKey: ['courses'] });
    localStorage.removeItem('coursesData');
    console.log("Cleared courses cache");
  };

  return {
    courses: query.data || [],
    loading: query.isLoading || query.isFetching,
    error: query.error ? 'Failed to load courses' : null,
    refreshCourses,
    clearCoursesCache
  };
}; 