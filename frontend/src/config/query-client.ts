import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once to avoid hanging
      staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for this long
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep in cache for this long
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: true, // Allow refetch when component mounts if data is stale
      throwOnError: false // Don't throw errors, let components handle them
    },
    mutations: {
      throwOnError: false // Don't throw errors, let components handle them
    }
  }
}); 