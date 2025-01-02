export interface CanvasAssignment {
  id: number;
  name: string;
  due_at: string;
  points_possible: number;
  grade?: string | number | null;
}

export interface CanvasCourse {
  id: number;
  name: string;
  code: string;
  assignments: CanvasAssignment[];
  homepage?: string | null;
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