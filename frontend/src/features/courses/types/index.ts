export interface Assignment {
  id: number;
  name: string;
  description: string | null;
  due_at: string;
  points_possible: number;
  grade?: string | null;
  submission_types: string[];
  html_url: string | null;
  lock_at: string | null;
  course_id: number;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  assignments: Assignment[];
  start_at: string | null;
  end_at: string | null;
  time_zone: string;
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