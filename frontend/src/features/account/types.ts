export interface UserSettings {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string | null;
  canvasUrl: string;
  apiToken: string;
  avatar_url: string | null;
  canvas_user_id: number;
} 