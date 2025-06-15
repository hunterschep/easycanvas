import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CourseService } from '../services/course.service';
import type { CanvasCourse } from '@/types/canvas.types';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';

export const useCourses = () => {
  const queryClient = useQueryClient();
  const { currentUser, initialAuthCheckComplete } = useAuth();
  const executionRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const query = useQuery({
    queryKey: ['courses', currentUser?.uid],
    queryFn: async () => {
      const executionId = Date.now().toString();
      executionRef.current = executionId;
      
      // If this is a page refresh, add a small delay to ensure cache clearing completes
      const isPageRefresh = performance.navigation?.type === 1;
      if (isPageRefresh) {
        console.log('⏱️ Page refresh detected, adding delay for cache clearing:', executionId);
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      }
      
      console.log('🔄 Fetching courses for user:', currentUser?.uid, 'execution:', executionId);
      
      // Set up timeout
      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Query timeout after 30 seconds'));
        }, 30000);
      });
      
      try {
        const coursesPromise = CourseService.getCourses(false);
        const courses = await Promise.race([coursesPromise, timeoutPromise]) as CanvasCourse[];
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // Check if this execution is still the current one
        if (executionRef.current !== executionId) {
          console.log('⚠️ Execution cancelled, newer execution in progress:', executionId);
          throw new Error('Execution cancelled');
        }
        
        console.log('✅ Courses fetched successfully:', courses?.length || 0, 'execution:', executionId);
        console.log('📦 Course data sample:', courses?.slice(0, 2)?.map(c => ({ id: c.id, name: c.name })));
        
        // Ensure we return the data and log it
        if (!courses) {
          console.warn('⚠️ Courses is null/undefined, returning empty array');
          return [];
        }
        
        console.log('🎯 Query function returning data, length:', courses.length, 'execution:', executionId);
        return courses;
      } catch (error) {
        // Clear timeout on error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        console.error("❌ Error in courses fetch:", error, 'execution:', executionId);
        throw error;
      }
    },
    enabled: !!currentUser && initialAuthCheckComplete,
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.message?.includes('timeout') || 
          error?.message?.includes('authenticated') ||
          error?.message?.includes('Execution cancelled') ||
          error?.message?.includes('Query timeout')) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: 1000,
  });

  // Log query status changes with more detail
  useEffect(() => {
    console.log('🔍 Query status changed:', {
      status: query.status,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
      isError: query.isError,
      hasData: !!query.data,
      dataLength: query.data?.length || 0,
      error: query.error?.message,
      timestamp: new Date().toISOString()
    });
    
    // Special logging for success state
    if (query.isSuccess && query.data) {
      console.log('🎉 QUERY SUCCESS! Data received:', {
        coursesCount: query.data.length,
        firstCourse: query.data[0]?.name,
        timestamp: new Date().toISOString()
      });
    }
  }, [query.status, query.isLoading, query.isFetching, query.isSuccess, query.isError, query.data]);

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

  // Comprehensive debug logging
  useEffect(() => {
    if (currentUser && initialAuthCheckComplete) {
      console.log('📊 useCourses state update:', {
        userId: currentUser.uid,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        hasData: !!query.data,
        dataLength: query.data?.length || 0,
        error: query.error,
        isEnabled: !!currentUser && initialAuthCheckComplete,
        timestamp: new Date().toISOString()
      });
    }
  }, [currentUser?.uid, initialAuthCheckComplete, query.isLoading, query.isFetching, query.data, query.error]);
  
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

  // Simplified loading state - only show loading if we're actually loading and don't have data
  const isLoading = (query.isLoading || query.isFetching) && !query.data;
  
  console.log('🎯 useCourses returning:', {
    coursesCount: query.data?.length || 0,
    loading: isLoading,
    hasError: !!query.error,
    queryStatus: query.status,
    rawState: {
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      hasData: !!query.data,
      isSuccess: query.isSuccess,
      isError: query.isError
    }
  });

  return {
    courses: query.data || [],
    loading: isLoading,
    error: query.error ? 'Failed to load courses' : null,
    refreshCourses,
    clearCoursesCache
  };
}; 