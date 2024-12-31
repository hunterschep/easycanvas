export interface Assignment {
  id: number;
  name: string;
  due_at: string;
  points_possible: number;
  grade?: string | number;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  assignments: Assignment[];
}

export interface UserData {
  canvasUrl: string;
  canvas_user_id: number;
  name: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  email?: string;
} 