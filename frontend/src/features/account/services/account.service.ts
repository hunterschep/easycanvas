import { ApiService } from '@/services/api/api.service';
import type { UserSettings } from '../types';
import { auth } from '../../../config/firebase.config';

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
    // First delete user data from our backend
    await ApiService.delete('/api/user');
    
    // Then delete Firebase auth account
    const user = auth.currentUser;
    if (user) {
        await user.delete();
    }
  }
} 