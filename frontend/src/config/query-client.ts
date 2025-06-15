import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on timeout or auth errors
        if (error?.message?.includes('timeout') || 
            error?.message?.includes('authenticated') ||
            error?.message?.includes('401')) {
          return false;
        }
        // Only retry once for other errors to avoid hanging
        return failureCount < 1;
      },
      retryDelay: 1000, // 1 second delay between retries
      staleTime: 0, // Always consider data stale to ensure fresh fetches
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep in cache for this long
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: true, // Refetch on mount to ensure fresh data
      throwOnError: false, // Don't throw errors, let components handle them
      // Add network error handling
      networkMode: 'online', // Only run queries when online
      // Remove notifyOnChangeProps restriction to ensure all updates trigger re-renders
    },
    mutations: {
      retry: 1, // Only retry mutations once
      throwOnError: false, // Don't throw errors, let components handle them
      networkMode: 'online', // Only run mutations when online
    }
  }
}); 