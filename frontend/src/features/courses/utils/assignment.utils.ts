import type { Assignment, FilterOptions, GroupedAssignments } from '../types';

export const groupAssignmentsByMonth = (
  assignments: Assignment[],
  filterOptions: FilterOptions
): GroupedAssignments => {
  let filtered = [...assignments];
  
  if (filterOptions.showGradedOnly) {
    filtered = filtered.filter(a => a.grade && a.grade !== 'N/A');
  }
  
  filtered.sort((a, b) => {
    switch (filterOptions.sortBy) {
      case 'due_date':
        return filterOptions.sortDirection === 'asc' 
          ? new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
          : new Date(b.due_at).getTime() - new Date(a.due_at).getTime();
      case 'name':
        return filterOptions.sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case 'grade':
        const aGrade = a.grade === 'N/A' ? -1 : Number(a.grade);
        const bGrade = b.grade === 'N/A' ? -1 : Number(b.grade);
        return filterOptions.sortDirection === 'asc'
          ? aGrade - bGrade
          : bGrade - aGrade;
      default:
        return 0;
    }
  });

  return filtered.reduce((groups, assignment) => {
    const date = new Date(assignment.due_at);
    if (date.getFullYear() < 1970 || isNaN(date.getTime())) {
      const key = 'Undated';
      if (!groups[key]) groups[key] = [];
      groups[key].push(assignment);
    } else {
      const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(assignment);
    }
    return groups;
  }, {} as GroupedAssignments);
};

export const calculateGradeSummary = (assignments: Assignment[]) => {
  const gradedAssignments = assignments.filter(a => 
    a.grade && a.grade !== 'N/A' && !isNaN(Number(a.grade))
  );

  const totalEarned = gradedAssignments.reduce((sum, a) => 
    sum + Number(a.grade), 0
  );
  
  const totalPossible = gradedAssignments.reduce((sum, a) => 
    sum + (a.points_possible || 0), 0
  );

  return {
    earned: totalEarned,
    possible: totalPossible,
    count: gradedAssignments.length
  };
}; 