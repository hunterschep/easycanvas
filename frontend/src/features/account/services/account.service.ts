import { ApiService } from '@/services/api/api.service';
import type { UserSettings } from '../types';
import { auth } from '../../../config/firebase.config';
import { 
  reauthenticateWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';

export class AccountService {
  static async getUserSettings(): Promise<UserSettings> {
    return ApiService.get('/api/user/settings');
  }

  static async updateProfile(updates: {
    first_name: string;
    last_name: string;
    name: string;
  }): Promise<UserSettings> {
    return ApiService.patch('/api/user/settings', {
      first_name: updates.first_name,
      last_name: updates.last_name
    });
  }

  static async updateCanvasIntegration(canvasUrl: string, apiToken?: string): Promise<UserSettings> {
    const formattedUrl = canvasUrl.startsWith('http') ? canvasUrl : `https://${canvasUrl}`;
    
    // Only include apiToken if it's provided and not empty
    const updateData: { canvasUrl: string; apiToken?: string } = {
      canvasUrl: formattedUrl
    };

    if (apiToken && apiToken.trim() !== '') {
      updateData.apiToken = apiToken;
    }

    return ApiService.patch('/api/user/settings', updateData);
  }

  static async deleteAccount(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
      // First delete user data from our backend
      await ApiService.delete('/api/user');
    } catch (error) {
      console.error('Backend deletion failed:', error);
      throw error;
    }
    
    try {
      // Try to delete Firebase account
      await user.delete();
    } catch (error: any) {
      // If re-authentication is required
      if (error.code === 'auth/requires-recent-login') {
        // Re-authenticate with Google
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
        // Try deleting again after re-authentication
        await user.delete();
      } else {
        throw error;
      }
    }
  }
} 