import { ApiService } from '@/services/api/api.service';
import { auth } from '@/config/firebase.config';

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  estimatedTime?: string;
  course?: string;
  completed: boolean;
}

export interface DeadlineItem {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  priority: 'urgent' | 'important' | 'normal';
  points?: number;
  description?: string;
}

export interface StudyBlock {
  id: string;
  title: string;
  course: string;
  duration: string;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InsightCard {
  id: string;
  type: 'tip' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  action?: string;
}

export interface AIPlannerResponse {
  todos: TodoItem[];
  deadlines: DeadlineItem[];
  studyBlocks: StudyBlock[];
  insights: InsightCard[];
  summary: {
    totalTasks: number;
    highPriorityCount: number;
    upcomingDeadlines: number;
    estimatedStudyTime: string;
  };
  generated_at: string;
  course_count: number;
  assignment_count: number;
}

export class AIPlannerService {
  static async generatePlan(forceRegenerate: boolean = false): Promise<AIPlannerResponse> {
    try {
      console.log('📡 [AI Planner Service] Starting AI Planner API call (extended timeout)');
      console.log('📡 [AI Planner Service] Force regenerate:', forceRegenerate);
      
      const startTime = performance.now();
      
      // Custom fetch with extended timeout for AI operations (2 minutes)
      const endpoint = forceRegenerate 
        ? '/api/ai-planner/generate?force_regenerate=true' 
        : '/api/ai-planner/generate';
      const response = await this.postWithExtendedTimeout(endpoint, {});
      const endTime = performance.now();
      
      console.log('📡 [AI Planner Service] API call completed in', Math.round(endTime - startTime), 'ms');
      console.log('📡 [AI Planner Service] Response received:', {
        course_count: response.course_count,
        assignment_count: response.assignment_count,
        generated_at: response.generated_at,
        todo_list_length: response.todo_list?.length || 0,
        todo_list_preview: response.todo_list?.slice(0, 100) + '...' || 'No content'
      });
      
      return response;
    } catch (error) {
      console.error('📡 [AI Planner Service] Error generating AI plan:', error);
      console.error('📡 [AI Planner Service] Error type:', typeof error);
      console.error('📡 [AI Planner Service] Error details:', {
        message: (error as any)?.message,
        status: (error as any)?.status,
        statusText: (error as any)?.statusText,
        response: (error as any)?.response
      });
      throw error;
    }
  }

  // Custom method with extended timeout for AI operations
  private static async postWithExtendedTimeout(endpoint: string, data: any): Promise<AIPlannerResponse> {
    const EXTENDED_TIMEOUT = 120000; // 2 minutes for AI operations
    
    try {
      console.log('📡 [AI Planner Service] Using extended timeout of', EXTENDED_TIMEOUT / 1000, 'seconds');
      
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Not authenticated');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('📡 [AI Planner Service] Request timeout after', EXTENDED_TIMEOUT / 1000, 'seconds');
        controller.abort();
      }, EXTENDED_TIMEOUT);

      console.log('📡 [AI Planner Service] Making fetch request to backend...');
      
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      console.log('📡 [AI Planner Service] Fetch completed! Response status:', response.status);
      console.log('📡 [AI Planner Service] Response headers:', Object.fromEntries(response.headers.entries()));
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('📡 [AI Planner Service] API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        
        const error = new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        // @ts-ignore
        error.status = response.status;
        // @ts-ignore
        error.data = errorData;
        throw error;
      }

      console.log('📡 [AI Planner Service] About to parse JSON response...');
      const result = await response.json();
      console.log('📡 [AI Planner Service] JSON parsing completed successfully');
      console.log('📡 [AI Planner Service] Response data keys:', Object.keys(result));
      console.log('📡 [AI Planner Service] Response data preview:', {
        course_count: result.course_count,
        assignment_count: result.assignment_count,
        generated_at: result.generated_at,
        todos_count: result.todos?.length || 0,
        deadlines_count: result.deadlines?.length || 0,
        studyBlocks_count: result.studyBlocks?.length || 0,
        insights_count: result.insights?.length || 0
      });
      return result;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('📡 [AI Planner Service] Request aborted due to timeout');
        throw new Error(`AI generation timeout after ${EXTENDED_TIMEOUT / 1000} seconds. The AI is working hard on your plan - please try again.`);
      }
      
      // Check for various network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('📡 [AI Planner Service] Network/fetch error:', error);
        throw new Error('Network connection error. Please check your internet connection and try again.');
      }
      
      if (error.message && error.message.includes('JSON')) {
        console.error('📡 [AI Planner Service] JSON parsing error:', error);
        throw new Error('Response parsing error. The server response may be corrupted.');
      }
      
      console.error('📡 [AI Planner Service] Unknown error type:', {
        name: error.name,
        message: error.message,
        type: typeof error,
        constructor: error.constructor?.name
      });
      
      console.error('📡 [AI Planner Service] Full error:', error);
      throw error;
    }
  }
}
