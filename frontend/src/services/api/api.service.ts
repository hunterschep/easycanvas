import { auth } from '@/config/firebase.config';

export class ApiService {
    private static readonly BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
    static async getAuthHeaders(): Promise<Headers> {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Not authenticated');
      }
  
      return new Headers({
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      });
    }
  
    static async get<T>(endpoint: string): Promise<T> {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.BASE_URL}${endpoint}`, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('NEW_USER');
        }
        throw new Error(`API Error: ${response.statusText}`);
      }
  
      return response.json();
    }
  
    static async post<T>(endpoint: string, data: any): Promise<T> {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API Error');
      }
  
      return response.json();
    }
  
    static async delete<T>(endpoint: string): Promise<T> {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API Error');
      }
  
      return response.json();
    }
  
    static async patch<T>(endpoint: string, data: any): Promise<T> {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API Error');
      }
  
      return response.json();
    }
}