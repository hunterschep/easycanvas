import { useState, useEffect } from 'react';
import { CourseService } from '../services/course.service';

interface ModuleItem {
  id: number;
  title: string;
  type: string;
  html_url: string;
  content_id?: number;
  completion_requirement?: {
    type: string;
    min_score?: number;
    completed: boolean;
  };
}

export const useModuleItems = (courseId: string | number, moduleId: string | number) => {
  const [items, setItems] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModuleItems = async () => {
      try {
        setLoading(true);
        const moduleItems = await CourseService.getModuleItems(courseId, moduleId);
        setItems(moduleItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch module items');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && moduleId) {
      fetchModuleItems();
    }
  }, [courseId, moduleId]);

  return { items, loading, error };
}; 