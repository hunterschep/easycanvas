import { useQuery } from '@tanstack/react-query';
import { Course } from '../types';
import { CourseService } from '../services/course.service';

export const useAnnouncements = (courses: Course[]) => {
  return useQuery({
    queryKey: ['announcements', courses.map(c => c.id)],
    queryFn: () => CourseService.getAnnouncements(courses),
    enabled: courses.length > 0,
  });
};