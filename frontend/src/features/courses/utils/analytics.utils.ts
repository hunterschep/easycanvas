import { Assignment } from '../types';

export const calculateTimelineMetrics = (assignments: Assignment[]) => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(todayStart.getDate() + 7);

  const dueToday = assignments.filter(a => {
    const dueDate = new Date(a.due_at);
    return dueDate >= todayStart && dueDate < new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  });

  const dueThisWeek = assignments.filter(a => {
    const dueDate = new Date(a.due_at);
    return dueDate >= todayStart && dueDate <= weekEnd;
  });

  return {
    dueToday,
    dueThisWeek: dueThisWeek.length,
    dueTodayPoints: dueToday.reduce((sum, a) => sum + (a.points_possible || 0), 0),
    dueThisWeekPoints: dueThisWeek.reduce((sum, a) => sum + (a.points_possible || 0), 0)
  };
};

export const calculateWorkloadDistribution = (assignments: Assignment[]) => {
  const now = new Date();
  const upcomingAssignments = assignments.filter(a => 
    a.due_at && new Date(a.due_at) > now
  );

  // Group by course
  const workloadByCourse = upcomingAssignments.reduce((acc, assignment) => {
    const courseId = assignment.course_id;
    acc[courseId] = {
      count: (acc[courseId]?.count || 0) + 1,
      points: (acc[courseId]?.points || 0) + (assignment.points_possible || 0)
    };
    return acc;
  }, {} as Record<string, { count: number; points: number }>);

  // Find heaviest day
  const workloadByDay = upcomingAssignments.reduce((acc, assignment) => {
    const dueDate = new Date(assignment.due_at!).toLocaleDateString();
    acc[dueDate] = {
      count: (acc[dueDate]?.count || 0) + 1,
      points: (acc[dueDate]?.points || 0) + (assignment.points_possible || 0),
      courses: [...(acc[dueDate]?.courses || []), assignment.course_id]
    };
    return acc;
  }, {} as Record<string, { count: number; points: number; courses: number[] }>);

  const heaviestDay = Object.entries(workloadByDay)
    .sort(([,a], [,b]) => b.points - a.points)[0];

  return {
    upcomingCount: upcomingAssignments.length,
    heaviestDay,
    workloadByCourse,
    totalUpcomingPoints: upcomingAssignments.reduce((sum, a) => 
      sum + (a.points_possible || 0), 0
    )
  };
};

export const calculatePerformanceMetrics = (assignments: Assignment[]) => {
  const gradedAssignments = assignments.filter(a => a.grade && a.grade !== 'N/A');
  const totalPoints = assignments.reduce((sum, a) => sum + (a.points_possible || 0), 0);
  const earnedPoints = gradedAssignments.reduce((sum, a) => 
    sum + (Number(a.grade) || 0), 0
  );

  return {
    totalPoints,
    earnedPoints,
    completionRate: (gradedAssignments.length / assignments.length) * 100,
    pointsProgress: totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
  };
}; 

/* Available assignment fields 
    id: int
    name: str
    description: Optional[str] = None
    due_at: Optional[datetime] = None
    points_possible: float = 0
    submission_types: List[str] = []
    html_url: Optional[str] = None
    lock_at: Optional[datetime] = None
    course_id: int
    grade: Optional[str] = 'N/A'


    Available course fields
    class Course(BaseModel):
    id: int
    name: str
    code: str
    assignments: List[Assignment] = []
    term: Optional[int] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    time_zone: str = "UTC"
    homepage: Optional[str] = None  # Will be populated separately from front_page endpoint

    */



