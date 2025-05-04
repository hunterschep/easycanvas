export interface CanvasAssignment {
  id: number;
  name: string;
  due_at: string;
  points_possible: number;
  grade?: string | number | null;
  has_submitted_submissions: boolean;
}

export interface CanvasModule {
  id: number;
  name: string;
  position: number;
  unlock_at: string | null;
  workflow_state: string;
  state: string | null;
  completed_at: string | null;
  require_sequential_progress: boolean;
  published: boolean;
  items_count: number;
  items_url: string;
  prerequisite_module_ids: number[];
}

export interface CanvasCourse {
  id: number;
  name: string;
  code: string;
  assignments: CanvasAssignment[];
  modules: CanvasModule[];
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