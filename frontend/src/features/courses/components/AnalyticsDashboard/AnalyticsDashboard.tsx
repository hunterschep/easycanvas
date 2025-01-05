import { useMemo } from 'react';
import { Assignment } from '../../types';
import { 
  calculateTimelineMetrics, 
  calculateWorkloadDistribution,
  calculatePerformanceMetrics 
} from '../../utils/analytics.utils';

interface AnalyticsDashboardProps {
  assignments: Assignment[];
}

export const AnalyticsDashboard = ({ assignments }: AnalyticsDashboardProps) => {
  const timelineMetrics = useMemo(() => 
    calculateTimelineMetrics(assignments), [assignments]);
  
  const workloadMetrics = useMemo(() => 
    calculateWorkloadDistribution(assignments), [assignments]);
  
  const performanceMetrics = useMemo(() => 
    calculatePerformanceMetrics(assignments), [assignments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Timeline Analysis Card */}
      <div className="relative group h-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-black border border-gray-800 rounded-lg p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Due Soon</h3>
          <div className="space-y-4 flex-grow">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1.5 rounded-full border text-purple-400 border-purple-900 bg-purple-900/20">
                Due Today
              </span>
              <div className="text-right">
                <span className="text-purple-400 font-medium">{timelineMetrics.dueToday.length}</span>
                <span className="text-gray-500 text-sm ml-1">assignments</span>
                <p className="text-gray-500 text-sm">{timelineMetrics.dueTodayPoints} points</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1.5 rounded-full border text-white border-gray-800 bg-gray-800/20">
                Due This Week
              </span>
              <div className="text-right">
                <span className="text-white font-medium">{timelineMetrics.dueThisWeek}</span>
                <span className="text-gray-500 text-sm ml-1">assignments</span>
                <p className="text-gray-500 text-sm">{timelineMetrics.dueThisWeekPoints} points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Distribution Card */}
      <div className="relative group h-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-black border border-gray-800 rounded-lg p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Workload Analysis</h3>
          <div className="space-y-4 flex-grow">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1.5 rounded-full border text-blue-400 border-blue-900 bg-blue-900/20">
                Heaviest Day
              </span>
              <div className="text-right">
                <span className="text-blue-400 font-medium">
                  {workloadMetrics.heaviestDay ? 
                    new Date(workloadMetrics.heaviestDay[0]).toLocaleDateString('default', {
                      month: 'short',
                      day: 'numeric'
                    }) : 
                    'None'}
                </span>
                <p className="text-gray-500 text-sm">
                  {workloadMetrics.heaviestDay ? 
                    `${workloadMetrics.heaviestDay[1].count} assignments (${workloadMetrics.heaviestDay[1].points}pts)` :
                    'No upcoming assignments'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1.5 rounded-full border text-white border-gray-800 bg-gray-800/20">
                Course Load
              </span>
              <div className="text-right">
                <span className="text-white font-medium">{Object.keys(workloadMetrics.workloadByCourse).length}</span>
                <span className="text-gray-500 text-sm ml-1">active courses</span>
                <p className="text-gray-500 text-sm">{workloadMetrics.upcomingCount} total assignments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Points Progress Card */}
      <div className="relative group h-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-black border border-gray-800 rounded-lg p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Points Progress</h3>
          <div className="space-y-4 flex-grow">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1.5 rounded-full border text-green-400 border-green-900 bg-green-900/20">
                Points Earned
              </span>
              <div className="text-right">
                <span className="text-green-400 font-medium">{performanceMetrics.earnedPoints}</span>
                <span className="text-gray-500 text-sm ml-1">/ {performanceMetrics.totalPoints}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1.5 rounded-full border text-white border-gray-800 bg-gray-800/20">
                Progress
              </span>
              <div className="text-right">
                <span className="text-white font-medium">{performanceMetrics.pointsProgress.toFixed(1)}%</span>
                <p className="text-gray-500 text-sm">completion rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
