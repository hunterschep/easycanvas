import { auth, googleProvider } from '@/config/firebase.config';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { ApiService } from '@/services/api/api.service';
import type { UserSettings } from '../types';
import { useNavigate } from 'react-router-dom';

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
      await firebaseSignOut(auth);
      window.location.href = '/'; // Redirect to landing page after sign out
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