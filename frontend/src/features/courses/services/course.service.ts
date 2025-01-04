import { ApiService } from '@/services/api/api.service';
import type { Course, Assignment, CourseBase } from '../types';

interface SelectedCoursesResponse {
  selected_course_ids: number[];
}

export class CourseService {
  static async getCourses(forceRefresh: boolean = false): Promise<Course[]> {
    return ApiService.get(`/api/user/courses${forceRefresh ? '?force=true' : ''}`);
  }

  static async getAvailableCourses(): Promise<CourseBase[]> {
    return ApiService.get('/api/user/courses/available');
  }

  static async saveSelectedCourses(courseIds: number[]): Promise<void> {
    return ApiService.post('/api/user/courses/select', courseIds);
  }

  static async getSelectedCourses(): Promise<number[]> {
    const response = await ApiService.get<SelectedCoursesResponse>('/api/user/courses/selected');
    return response.selected_course_ids;
  }

  static async getCourseDetails(courseId: string): Promise<Course> {
    return ApiService.get(`/api/user/courses/${courseId}`);
  }

  static async getAssignment(courseId: string, assignmentId: string): Promise<Assignment> {
    return ApiService.get(`/api/user/courses/${courseId}/assignments/${assignmentId}`);
  }
} 
