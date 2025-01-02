import { ApiService } from '@/services/api/api.service';
import type { Course, Assignment } from '../types';

export class CourseService {
  static async getCourses(forceRefresh: boolean = false): Promise<Course[]> {
    return ApiService.get(`/api/user/courses${forceRefresh ? '?force=true' : ''}`);
  }

  static async getCourseDetails(courseId: string): Promise<Course> {
    return ApiService.get(`/api/user/courses/${courseId}`);
  }

  static async getAssignment(courseId: string, assignmentId: string): Promise<Assignment> {
    return ApiService.get(`/api/user/courses/${courseId}/assignments/${assignmentId}`);
  }

} 
