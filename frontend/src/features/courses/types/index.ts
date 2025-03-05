import type { CanvasAssignment, CanvasCourse, CanvasModule, CanvasAnnouncement} from '@/types/canvas.types';

export interface Assignment extends CanvasAssignment {
  description: string | null;
  submission_types: string[];
  html_url: string | null;
  lock_at: string | null;
  course_id: number;
  grade?: string | null;
  has_submitted_submissions: boolean;
}

export interface Course extends CanvasCourse {
  modules: CanvasModule[];
  assignments: Assignment[];
  announcements: CanvasAnnouncement[];
  start_at: string | null;
  end_at: string | null;
  time_zone: string;
  homepage?: string | null;
}

export interface CourseBase {
  id: number;
  name: string;
  code: string;
  term?: number;
  start_at?: string | null;
  end_at?: string | null;
}

export interface FilterOptions {
  showGradedOnly: boolean;
  sortBy: 'due_date' | 'name' | 'grade';
  sortDirection: 'asc' | 'desc';
}

export interface GradeSummary {
  earned: number;
  possible: number;
  count: number;
}

export interface GroupedAssignments {
  [key: string]: Assignment[];
}

export interface EnhancedAnnouncement extends CanvasAnnouncement {
  courseName: string;
  courseId: number;
} 