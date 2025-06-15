import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CourseService } from '../services/course.service';
import type { CanvasCourse } from '@/types/canvas.types';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';

export const useCourses = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  const query = useQuery({
    queryKey: ['courses', currentUser?.uid],
    queryFn: async () => {
      console.log('Fetching courses for user:', currentUser?.uid);
      try {
        const courses = await CourseService.getCourses(false);
        console.log('Courses fetched successfully:', courses?.length || 0);
        return courses;
      } catch (error) {
        console.error("Error in courses fetch:", error);
        // Don't return empty array on error, let React Query handle the error
        throw error;
      }
    },
    enabled: !!currentUser,
  });

  // Effect to handle new users who might not have course data yet
  useEffect(() => {
    const checkAndFetchInitialData = async () => {
      if (currentUser && query.data && query.data.length === 0 && !query.isFetching && !query.isError) {
        console.log("No courses found - likely a new user. Forcing a refresh.");
        try {
          await refreshCourses(true);
        } catch (error) {
          console.error("Error in force refresh:", error);
        }
      }
    };

    checkAndFetchInitialData();
  }, [query.data, query.isFetching, query.isError, currentUser]);
  
  const refreshCourses = async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) {
        console.log("Forcing a full course refresh from Canvas");
        const freshData = await CourseService.getCourses(true);
        queryClient.setQueryData(['courses', currentUser?.uid], freshData);
        return freshData;
      }
      return query.refetch();
    } catch (error) {
      console.error("Error refreshing courses:", error);
      throw error;
    }
  };

  const clearCoursesCache = () => {
    queryClient.removeQueries({ queryKey: ['courses', currentUser?.uid] });
    console.log("Cleared courses cache for user:", currentUser?.uid);
  };

  return {
    courses: query.data || [],
    loading: query.isLoading || query.isFetching,
    error: query.error ? 'Failed to load courses' : null,
    refreshCourses,
    clearCoursesCache
  };
}; 