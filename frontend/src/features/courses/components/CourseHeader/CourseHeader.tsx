import type { Course } from '../../types';
import type { GradeSummary } from '../../types';

interface CourseHeaderProps {
  course: Course;
  gradeSummary: GradeSummary;
}

export const CourseHeader = ({ course, gradeSummary }: CourseHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
        <p className="text-gray-400">{course.code}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-400">Grade Summary</p>
        <p className="text-2xl font-bold">
          {gradeSummary.earned}/{gradeSummary.possible}
        </p>
        <p className="text-sm text-gray-400">
          {gradeSummary.count} graded assignments
        </p>
      </div>
    </div>
  );
}; 