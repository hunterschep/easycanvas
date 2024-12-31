import { useState, useEffect } from 'react';
import type { Course } from '../types';
import { getUserCourses } from '@/firebase/firestore';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      const coursesData = await getUserCourses(forceRefresh);
      setCourses(coursesData);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(false);
  }, []);

  return { courses, loading, error, refreshCourses: fetchCourses };
}; 