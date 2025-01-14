import { auth } from '@/config/firebase.config';

export class ApiService {
    private static baseUrl = 'http://localhost:8000';
  
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

    static async get<T>(endpoint: string): Promise<T> {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers,
        credentials: 'include',
        mode: 'cors'
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return response.json();
    }
  
    static async post<T>(endpoint: string, data: any): Promise<T> {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
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
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
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
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
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