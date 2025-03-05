import { useMemo } from 'react';
import { Course } from '../types';
import type { EnhancedAnnouncement } from '../types';

export const useAnnouncements = (courses: Course[]): EnhancedAnnouncement[] => {
  return useMemo(() => {
    const allAnnouncements = courses.flatMap(course => 
      course.announcements.map(announcement => ({
        ...announcement,
        courseName: course.name,
        courseId: course.id
      }))
    );

    // Sort by posted date, newest first
    return allAnnouncements.sort((a, b) => 
      new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
    );
  }, [courses]);
};