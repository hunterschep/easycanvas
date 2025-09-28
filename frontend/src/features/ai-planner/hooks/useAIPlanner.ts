import { useMutation } from '@tanstack/react-query';
import { AIPlannerService, AIPlannerResponse } from '../services/ai-planner.service';

interface UseAIPlannerResult {
  generatePlan: () => void;
  isGenerating: boolean;
  planData: AIPlannerResponse | undefined;
  error: Error | null;
  isSuccess: boolean;
}

export const useAIPlanner = (): UseAIPlannerResult => {
  const mutation = useMutation({
    mutationFn: () => {
      console.log('🤖 [AI Planner Hook] Starting AI plan generation...');
      return AIPlannerService.generatePlan();
    },
    retry: (failureCount, error) => {
      // Don't retry on timeout errors to avoid spam
      const isTimeoutError = error.message?.includes('timeout') || error.name === 'AbortError';
      if (isTimeoutError) {
        console.log('🤖 [AI Planner Hook] Not retrying timeout error');
        return false;
      }
      // Only retry auth/network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: 3000, // 3 seconds between retries
    onMutate: () => {
      console.log('🤖 [AI Planner Hook] Mutation started (onMutate)');
    },
    onSuccess: (data) => {
      console.log('🤖 [AI Planner Hook] === SUCCESS CALLBACK TRIGGERED ===');
      console.log('🤖 [AI Planner Hook] AI plan generated successfully:', data);
      console.log('🤖 [AI Planner Hook] Plan length:', data.todo_list?.length || 0);
      console.log('🤖 [AI Planner Hook] Mutation data should now be available in component');
      
      // Just log that success was called - can't reference mutation here
      console.log('🤖 [AI Planner Hook] Success callback completed');
    },
    onError: (error) => {
      console.error('🤖 [AI Planner Hook] Failed to generate AI plan:', error);
      console.error('🤖 [AI Planner Hook] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Check if this is a timeout error vs auth error
      const isTimeoutError = error.message?.includes('timeout') || error.name === 'AbortError';
      if (isTimeoutError) {
        console.warn('🤖 [AI Planner Hook] Timeout error detected - this should not cause auth redirect');
      } else {
        console.warn('🤖 [AI Planner Hook] Non-timeout error - might be auth related');
      }
    },
    onSettled: (data, error) => {
      console.log('🤖 [AI Planner Hook] Mutation settled:', { 
        hasData: !!data, 
        hasError: !!error,
        isSuccess: !!data && !error 
      });
    },
  });

  return {
    generatePlan: mutation.mutate,
    isGenerating: mutation.isPending,
    planData: mutation.data,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};
