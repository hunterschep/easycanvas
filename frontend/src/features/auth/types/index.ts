import { User as FirebaseUser } from 'firebase/auth';

export interface AuthContextType {
  loading: boolean;
  hasCanvasToken: boolean;
  currentUser: FirebaseUser | null;
  signOut: () => Promise<void>;
}

export interface UserSettings {
  first_name: string;
  last_name: string;
  avatar_url: string;
  canvasUrl: string;
  name: string;
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  };
} 