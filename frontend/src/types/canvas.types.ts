export interface CanvasAssignment {
  id: number;
  name: string;
  due_at: string;
  points_possible: number;
  grade?: string | number | null;
  has_submitted_submissions: boolean;
  html_url?: string | null;
}

export interface CanvasAnnouncement {
  id: number;
  title: string;
  message: string | null;
  posted_at: string | null;
  url: string | null;
}

export interface CanvasModuleItem {
  id: number;
  title: string;
  position: number;
  indent: number;
  type: string | null;
  module_id: number;
  html_url: string | null;
  content_id: number | null;
  url: string | null;
  completion_requirement?: {
    type: string;
    completed?: boolean;
  } | null;
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
  items_url: string | null;
  prerequisite_module_ids: number[];
  items: CanvasModuleItem[];
}

export interface CanvasCourse {
  id: number;
  name: string;
  code: string;
  assignments: CanvasAssignment[];
  modules: CanvasModule[];
  announcements: CanvasAnnouncement[];
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

export interface CourseBase {
  id: number;
  name: string;
  code: string;
  term?: number;
  start_at?: string;
  end_at?: string;
}