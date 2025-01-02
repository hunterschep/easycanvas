import type { CanvasAssignment, CanvasCourse } from '@/types/canvas.types';

export interface Assignment extends CanvasAssignment {
  description: string | null;
  submission_types: string[];
  html_url: string | null;
  lock_at: string | null;
  course_id: number;
  grade?: string | null;
}

export interface Course extends CanvasCourse {
  assignments: Assignment[];
  start_at: string | null;
  end_at: string | null;
  time_zone: string;
  homepage?: string | null;
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