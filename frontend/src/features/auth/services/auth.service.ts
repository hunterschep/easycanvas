import { auth, googleProvider } from '@/config/firebase.config';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { ApiService } from '@/services/api/api.service';
import type { UserSettings } from '../types';
import { useNavigate } from 'react-router-dom';

// Import queryClient
import { queryClient } from '@/config/query-client';

export class AuthService {
  static async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      // Clear React Query cache
      queryClient.clear();
      
      // Clear UI-specific localStorage data (sidebar state, etc.)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('REACT_QUERY_OFFLINE_CACHE_') || 
            key.startsWith('easycanvas-sidebar-collapsed-')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('Cleared React Query cache and UI localStorage data');
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Force refresh the page to ensure clean state
      window.location.href = '/'; 
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  static async getUserSettings(): Promise<UserSettings> {
    return ApiService.get('/api/user/settings');
  }

  static async saveUserSettings(canvasUrl: string, apiToken: string): Promise<void> {
    const formattedUrl = canvasUrl.startsWith('http') ? canvasUrl : `https://${canvasUrl}`;
    await ApiService.post('/api/user/settings', {
      canvasUrl: formattedUrl,
      apiToken,
    });
  }
} 