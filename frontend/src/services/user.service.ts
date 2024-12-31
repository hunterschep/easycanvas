import { ApiService } from './api/api.service';
import { UserSettings } from '../types/auth.types';

export class UserService {
  static async saveSettings(canvasUrl: string, apiToken: string): Promise<boolean> {
    const formattedUrl = canvasUrl.startsWith('http') ? canvasUrl : `https://${canvasUrl}`;
    
    await ApiService.post<void>('/api/user/settings', {
      canvasUrl: formattedUrl,
      apiToken,
    });

    return true;
  }

  static async getSettings(): Promise<UserSettings> {
    return ApiService.get<UserSettings>('/api/user/settings');
  }

  static async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    return ApiService.post<UserSettings>('/api/user/settings/update', updates);
  }
} 