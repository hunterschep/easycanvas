import { useMemo } from 'react';
import type { Assignment } from '../types';

export const useGradeSummary = (assignments: Assignment[]) => {
  return useMemo(() => {
    const gradedAssignments = assignments?.filter(a => 
      a.grade && a.grade !== 'N/A' && !isNaN(Number(a.grade))
    ) || [];

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
  }, [assignments]);
}; 