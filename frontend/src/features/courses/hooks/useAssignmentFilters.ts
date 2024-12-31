import { useMemo } from 'react';
import { Assignment, FilterOptions } from '../types';

export const useAssignmentFilters = (assignments: Assignment[], filterOptions: FilterOptions) => {
  return useMemo(() => {
    let filtered = [...assignments];
    
    // Apply graded filter
    if (filterOptions.showGradedOnly) {
      filtered = filtered.filter(a => a.grade && a.grade !== 'N/A');
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (filterOptions.sortBy) {
        case 'due_date':
          const aDate = a.due_at ? new Date(a.due_at).getTime() : Number.MAX_SAFE_INTEGER;
          const bDate = b.due_at ? new Date(b.due_at).getTime() : Number.MAX_SAFE_INTEGER;
          return filterOptions.sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
        
        case 'name':
          return filterOptions.sortDirection === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        
        case 'grade':
          const aGrade = a.grade === 'N/A' ? -1 : Number(a.grade || 0);
          const bGrade = b.grade === 'N/A' ? -1 : Number(b.grade || 0);
          return filterOptions.sortDirection === 'asc' ? aGrade - bGrade : bGrade - aGrade;
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [assignments, filterOptions]);
}; 