import { ApiService } from '@/services/api/api.service';
import type { Course, Assignment, CourseBase, EnhancedAnnouncement } from '../types';

interface SelectedCoursesResponse {
  selected_course_ids: number[];
}

export class CourseService {
  // Helper to ensure IDs are consistently formatted
  private static normalizeId(id: string | number): string {
    return id.toString();
  }

  static async getCourses(forceRefresh: boolean = false): Promise<Course[]> {
    try {
      const endpoint = forceRefresh ? '/api/user/courses?force=true' : '/api/user/courses';
      return await ApiService.get(endpoint);
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  static async getAvailableCourses(): Promise<CourseBase[]> {
    try {
      return await ApiService.get('/api/user/courses/available');
    } catch (error) {
      console.error('Error fetching available courses:', error);
      throw error;
    }
  }

  static async saveSelectedCourses(courseIds: number[]): Promise<void> {
    try {
      return await ApiService.post('/api/user/courses/select', courseIds);
    } catch (error) {
      console.error('Error saving selected courses:', error);
      throw error;
    }
  }

  static async getSelectedCourses(): Promise<number[]> {
    try {
      const response = await ApiService.get<SelectedCoursesResponse>('/api/user/courses/selected');
      return response.selected_course_ids;
    } catch (error) {
      console.error('Error fetching selected courses:', error);
      throw error;
    }
  }

  static async getCourseDetails(courseId: string | number): Promise<Course> {
    try {
      const normalizedId = this.normalizeId(courseId);
      return await ApiService.get(`/api/user/courses/${normalizedId}`);
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }
  }

  static async getAssignment(courseId: string | number, assignmentId: string | number): Promise<Assignment> {
    try {
      const normalizedCourseId = this.normalizeId(courseId);
      const normalizedAssignmentId = this.normalizeId(assignmentId);
      console.log(`Fetching assignment from API: /api/user/courses/${normalizedCourseId}/assignments/${normalizedAssignmentId}`);
      return await ApiService.get(`/api/user/courses/${normalizedCourseId}/assignments/${normalizedAssignmentId}`);
    } catch (error) {
      console.error(`Error fetching assignment ${assignmentId} for course ${courseId}:`, error);
      throw error;
    }
  }

  static async getModuleItems(courseId: string | number, moduleId: string | number): Promise<any[]> {
    try {
      const normalizedCourseId = this.normalizeId(courseId);
      const normalizedModuleId = this.normalizeId(moduleId);
      return await ApiService.get(`/api/user/courses/${normalizedCourseId}/modules/${normalizedModuleId}/items`);
    } catch (error) {
      console.error(`Error fetching module items for module ${moduleId}:`, error);
      throw error;
    }
  }

  static async getAnnouncements(courses: Course[]): Promise<EnhancedAnnouncement[]> {
    try {
      const announcements = courses.flatMap(course => 
        course.announcements.map(announcement => ({
          ...announcement,
          courseName: course.name,
          courseId: course.id
        }))
      );
      return announcements;
    } catch (error) {
      console.error('Error processing announcements:', error);
      throw error;
    }
  }
} 
