import { auth } from '@/config/firebase.config';
import { logError, logInfo } from '@/utils/debug';

export class ApiService {
    private static baseUrl = 'http://localhost:8000';
    private static timeout = 30000; // 30 seconds timeout
  
    private static async getAuthHeaders() {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Not authenticated');
      }
      
      return {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      };
    }

    private static createTimeoutController(timeout: number = this.timeout) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      return { controller, timeoutId };
    }

    static async get<T>(endpoint: string): Promise<T> {
      const headers = await this.getAuthHeaders();
      const { controller, timeoutId } = this.createTimeoutController();
      logInfo(`🔄 API GET: ${endpoint}`);
      
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          headers,
          credentials: 'include',
          mode: 'cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      
        if (!response.ok) {
          const errorText = await response.text();
          let errorInfo;
          try {
            errorInfo = JSON.parse(errorText);
          } catch (e) {
            errorInfo = { message: errorText || 'Unknown error' };
          }
          
          const error = new Error(`HTTP error ${response.status}: ${errorInfo.message || response.statusText}`);
          // @ts-ignore
          error.status = response.status;
          // @ts-ignore
          error.response = response;
          // @ts-ignore
          error.data = errorInfo;
          
          logError(`API Error: ${endpoint}`, { status: response.status, data: errorInfo });
          throw error;
        }
      
        const data = await response.json();
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          logError(`API Request Timeout: ${endpoint}`, { timeout: this.timeout });
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        logError(`API Request Failed: ${endpoint}`, error);
        throw error;
      }
    }
  
    static async post<T>(endpoint: string, data: any): Promise<T> {
      const headers = await this.getAuthHeaders();
      const { controller, timeoutId } = this.createTimeoutController();
      logInfo(`🔄 API POST: ${endpoint}`);
      
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      
        if (!response.ok) {
          const errorData = await response.json();
          const error = new Error(errorData.detail || 'API Error');
          // @ts-ignore
          error.status = response.status;
          // @ts-ignore
          error.data = errorData;
          
          logError(`API Error: ${endpoint}`, { status: response.status, data: errorData });
          throw error;
        }
      
        const result = await response.json();
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          logError(`API Request Timeout: ${endpoint}`, { timeout: this.timeout });
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        logError(`API Request Failed: ${endpoint}`, error);
        throw error;
      }
    }
  
    static async delete<T>(endpoint: string): Promise<T> {
      const headers = await this.getAuthHeaders();
      const { controller, timeoutId } = this.createTimeoutController();
      logInfo(`🔄 API DELETE: ${endpoint}`);
      
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'DELETE',
          headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      
        if (!response.ok) {
          const errorData = await response.json();
          const error = new Error(errorData.detail || 'API Error');
          // @ts-ignore
          error.status = response.status;
          // @ts-ignore
          error.data = errorData;
          
          logError(`API Error: ${endpoint}`, { status: response.status, data: errorData });
          throw error;
        }
      
        const result = await response.json();
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          logError(`API Request Timeout: ${endpoint}`, { timeout: this.timeout });
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        logError(`API Request Failed: ${endpoint}`, error);
        throw error;
      }
    }
  
    static async patch<T>(endpoint: string, data: any): Promise<T> {
      const headers = await this.getAuthHeaders();
      const { controller, timeoutId } = this.createTimeoutController();
      logInfo(`🔄 API PATCH: ${endpoint}`);
      
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(data),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      
        if (!response.ok) {
          const errorData = await response.json();
          const error = new Error(errorData.detail || 'API Error');
          // @ts-ignore
          error.status = response.status;
          // @ts-ignore
          error.data = errorData;
          
          logError(`API Error: ${endpoint}`, { status: response.status, data: errorData });
          throw error;
        }
      
        const result = await response.json();
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          logError(`API Request Timeout: ${endpoint}`, { timeout: this.timeout });
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        logError(`API Request Failed: ${endpoint}`, error);
        throw error;
      }
    }
}