// frontend/src/components/CourseDetails.tsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Account from './Account';
import Loading from './Loading';

interface Assignment {
    id: number;
    name: string;
    due_at: string;
    points_possible: number;
    grade?: string | null;  // Optional grade field that can be string ('N/A') or null
    submission_types: string[];
    html_url: string | null;
    lock_at: string | null;
    course_id: number;
}

interface Course {
  id: number;
  name: string;
  code: string;
  assignments: Assignment[];
  start_at: string | null;
  end_at: string | null;
  time_zone: string;
}

interface FilterOptions {
  showGradedOnly: boolean;
  sortBy: 'due_date' | 'name' | 'grade';
  sortDirection: 'asc' | 'desc';
}

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    showGradedOnly: false,
    sortBy: 'due_date',
    sortDirection: 'asc'
  });

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // Reuse the existing courses data from localStorage or state management
        const coursesData = JSON.parse(localStorage.getItem('coursesData') || '[]');
        const foundCourse = coursesData.find((c: Course) => c.id === Number(courseId));
        
        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          // Handle course not found
          navigate('/home');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, navigate]);

  // Group assignments by month
  const groupedAssignments = useMemo(() => {
    let filtered = [...course?.assignments || []];
    
    // Apply filters
    if (filterOptions.showGradedOnly) {
      filtered = filtered.filter(a => a.grade && a.grade !== 'N/A');
    }
    
    // Sort assignments
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

    // Group by month, handling undated assignments
    return filtered.reduce((groups, assignment) => {
      const date = new Date(assignment.due_at);
      // Check for invalid/undated assignments (1969 or invalid date)
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
    }, {} as Record<string, Assignment[]>);
  }, [course?.assignments, filterOptions]);

  // Calculate total points
  const gradeSummary = useMemo(() => {
    const gradedAssignments = course?.assignments.filter(a => 
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
  }, [course?.assignments]);

  if (loading) {
    return <Loading message="Loading course details..." />;
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-all duration-200"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-black tracking-tighter">
                easy<span className="text-gray-500">canvas</span>
              </h1>
            </div>
            <Account />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
            <p className="text-gray-400">{course.code}</p>
          </div>
          
          {/* Grade Summary */}
          <div className="relative group">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-200">
              <svg 
                className="w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
              <span className="text-white">
                {gradeSummary.earned.toFixed(1)} / {gradeSummary.possible.toFixed(1)} pts
              </span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-gray-900 rounded-lg border border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <p className="text-sm text-gray-400 leading-relaxed">
                This represents total points earned ({gradeSummary.earned.toFixed(1)}) out of total points possible ({gradeSummary.possible.toFixed(1)}) for {gradeSummary.count} graded assignments. Note that this may not reflect your actual course grade as it doesn't account for weighted categories or ungraded work.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setFilterOptions(prev => ({
              ...prev,
              showGradedOnly: !prev.showGradedOnly
            }))}
            className={`px-4 py-2 rounded-lg border ${
              filterOptions.showGradedOnly 
                ? 'border-white text-white' 
                : 'border-gray-800 text-gray-400'
            } hover:border-gray-600 transition-all duration-200`}
          >
            Graded Only
          </button>
          
          <select
            value={filterOptions.sortBy}
            onChange={(e) => setFilterOptions(prev => ({
              ...prev,
              sortBy: e.target.value as FilterOptions['sortBy']
            }))}
            className="bg-black border border-gray-800 rounded-lg px-4 py-2 text-gray-400"
          >
            <option value="due_date">Due Date</option>
            <option value="name">Name</option>
            <option value="grade">Grade</option>
          </select>
          
          <button
            onClick={() => setFilterOptions(prev => ({
              ...prev,
              sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc'
            }))}
            className="px-4 py-2 text-gray-400 border border-gray-800 rounded-lg hover:border-gray-600"
          >
            {filterOptions.sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Assignments by Month */}
        <div className="space-y-6">
          {Object.entries(groupedAssignments).map(([month, assignments]) => (
            <div key={month} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black border border-gray-800 rounded-lg p-6">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <div className="flex items-center gap-2">
                      <svg 
                        className="w-4 h-4 transition-transform duration-200 group-open:rotate-90" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                      </svg>
                      <h2 className="text-xl font-bold">{month}</h2>
                    </div>
                    <span className="text-sm text-gray-400">
                      {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
                    </span>
                  </summary>
                  <div className="mt-4 space-y-4">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        onClick={() => navigate(`/course/${course.id}/assignment/${assignment.id}`)}
                        className="block p-4 border border-gray-800 rounded-lg hover:border-gray-600 transition-all duration-200 cursor-pointer"
                      >
                        <div className="space-y-2">
                          {/* Assignment Header */}
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-white">{assignment.name}</h3>
                            {assignment.points_possible > 0 && (
                              <span className="text-sm px-2 py-1 rounded-full border border-gray-800">
                                {assignment.points_possible} pts
                              </span>
                            )}
                          </div>
                          
                          {/* Assignment Details */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            {/* Due Date */}
                            {assignment.due_at && new Date(assignment.due_at).getFullYear() > 1970 && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Due: {new Date(assignment.due_at).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {/* Grade if available */}
                            {assignment.grade && assignment.grade !== 'N/A' && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                <span>{assignment.grade}/{assignment.points_possible}</span>
                              </div>
                            )}
                            
                            {/* Submission Type */}
                            {assignment.submission_types && assignment.submission_types.length > 0 && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;