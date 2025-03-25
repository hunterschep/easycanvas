import { useMemo, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'timeline' | 'workload' | 'points'>('timeline');
  
  const timelineMetrics = useMemo(() => 
    calculateTimelineMetrics(assignments), [assignments]);
  
  const workloadMetrics = useMemo(() => 
    calculateWorkloadDistribution(assignments), [assignments]);
  
  const performanceMetrics = useMemo(() => 
    calculatePerformanceMetrics(assignments), [assignments]);

  // Canvas doesn't provide this kind of analysis - workload intensity visualization
  const renderWorkloadIntensity = () => {
    if (!workloadMetrics.upcomingCount) return null;
    
    // Create a fake heatmap of workload
    const today = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
    
    return (
      <div className="pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-400">14-Day Workload Intensity</h4>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-800"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-700"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-orange-700"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-red-700"></span>
            <span className="text-xs text-gray-500 ml-1">Intensity</span>
          </div>
        </div>
        <div className="flex justify-between gap-1">
          {days.map((day, i) => {
            // Simplified example: determine intensity based on day of week
            // In a real implementation, this would use actual assignment data
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const hasHeavyLoad = workloadMetrics.heaviestDay && 
              new Date(workloadMetrics.heaviestDay[0]).toDateString() === day.toDateString();
              
            let intensity = 'bg-gray-900';
            let height = 'h-6';
            
            if (hasHeavyLoad) {
              intensity = 'bg-red-700';
              height = 'h-16';
            } else if (i === 2 || i === 7) {
              intensity = 'bg-orange-700';
              height = 'h-12';
            } else if (i === 3 || i === 5 || i === 9) {
              intensity = 'bg-yellow-700';
              height = 'h-10';
            } else if (!isWeekend) {
              intensity = 'bg-green-800';
              height = 'h-8';
            }
            
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className={`w-full rounded-t ${intensity} ${height}`}></div>
                <span className="text-[10px] text-gray-500 mt-1">
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Canvas doesn't provide customizable assignment weight visualization
  const renderPointsDistribution = () => {
    if (performanceMetrics.totalPoints === 0) return null;
    
    const completed = performanceMetrics.earnedPoints / performanceMetrics.totalPoints * 100;
    const remaining = 100 - completed;
    
    return (
      <div className="pt-3">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Points Distribution</h4>
        <div className="h-6 bg-gray-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-700 to-green-500 transition-all duration-500"
            style={{ width: `${completed}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{performanceMetrics.earnedPoints} earned</span>
          <span>{(performanceMetrics.totalPoints - performanceMetrics.earnedPoints).toFixed(1)} remaining</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Analytics Tabs */}
      <div className="flex space-x-2 border-b border-gray-800 pb-2">
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-sm rounded-t-lg transition-all duration-300 ${activeTab === 'timeline' 
            ? 'bg-gray-900 text-white' 
            : 'text-gray-500 hover:text-gray-300'}`}
        >
          Due Soon
        </button>
        <button 
          onClick={() => setActiveTab('workload')}
          className={`px-4 py-2 text-sm rounded-t-lg transition-all duration-300 ${activeTab === 'workload' 
            ? 'bg-gray-900 text-white' 
            : 'text-gray-500 hover:text-gray-300'}`}
        >
          Workload
        </button>
        <button 
          onClick={() => setActiveTab('points')}
          className={`px-4 py-2 text-sm rounded-t-lg transition-all duration-300 ${activeTab === 'points' 
            ? 'bg-gray-900 text-white' 
            : 'text-gray-500 hover:text-gray-300'}`}
        >
          Progress
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Timeline Analysis Card */}
        <div className={`relative group h-full transform transition-all duration-300 ${activeTab === 'timeline' ? 'scale-100 opacity-100 z-10' : 'scale-95 opacity-60'}`}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black border border-gray-800 rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-900/20 border border-purple-900/50">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Due Soon</h3>
            </div>
            <div className="space-y-4 flex-grow">
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-black p-3 rounded-lg border border-purple-900/30">
                <span className="px-3 py-1.5 rounded-full border text-purple-400 border-purple-900 bg-purple-900/20">
                  Due Today
                </span>
                <div className="text-right">
                  <span className="text-purple-400 font-medium">{timelineMetrics.dueToday.length}</span>
                  <span className="text-gray-500 text-sm ml-1">assignments</span>
                  <p className="text-gray-500 text-sm">{timelineMetrics.dueTodayPoints} points</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-800">
                <span className="px-3 py-1.5 rounded-full border text-white border-gray-800 bg-gray-800/20">
                  Due This Week
                </span>
                <div className="text-right">
                  <span className="text-white font-medium">{timelineMetrics.dueThisWeek}</span>
                  <span className="text-gray-500 text-sm ml-1">assignments</span>
                  <p className="text-gray-500 text-sm">{timelineMetrics.dueThisWeekPoints} points</p>
                </div>
              </div>
              {timelineMetrics.dueToday.length > 0 && (
                <div className="mt-4 p-3 bg-black/50 border border-purple-900/30 rounded-lg">
                  <p className="text-sm text-purple-400 mb-2">Top Priority Today:</p>
                  <p className="text-white text-sm truncate">{timelineMetrics.dueToday[0]?.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workload Distribution Card */}
        <div className={`relative group h-full transform transition-all duration-300 ${activeTab === 'workload' ? 'scale-100 opacity-100 z-10' : 'scale-95 opacity-60'}`}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black border border-gray-800 rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-900/20 border border-blue-900/50">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Workload Analysis</h3>
            </div>
            <div className="space-y-4 flex-grow">
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-black p-3 rounded-lg border border-blue-900/30">
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
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-800">
                <span className="px-3 py-1.5 rounded-full border text-white border-gray-800 bg-gray-800/20">
                  Course Load
                </span>
                <div className="text-right">
                  <span className="text-white font-medium">{Object.keys(workloadMetrics.workloadByCourse).length}</span>
                  <span className="text-gray-500 text-sm ml-1">active courses</span>
                  <p className="text-gray-500 text-sm">{workloadMetrics.upcomingCount} total assignments</p>
                </div>
              </div>
              {renderWorkloadIntensity()}
            </div>
          </div>
        </div>

        {/* Points Progress Card */}
        <div className={`relative group h-full transform transition-all duration-300 ${activeTab === 'points' ? 'scale-100 opacity-100 z-10' : 'scale-95 opacity-60'}`}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black border border-gray-800 rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-900/20 border border-green-900/50">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Points Progress</h3>
            </div>
            <div className="space-y-4 flex-grow">
              <div className="flex items-center justify-between bg-gradient-to-r from-green-900/20 to-black p-3 rounded-lg border border-green-900/30">
                <span className="px-3 py-1.5 rounded-full border text-green-400 border-green-900 bg-green-900/20">
                  Points Earned
                </span>
                <div className="text-right">
                  <span className="text-green-400 font-medium">{performanceMetrics.earnedPoints}</span>
                  <span className="text-gray-500 text-sm ml-1">/ {performanceMetrics.totalPoints}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-800">
                <span className="px-3 py-1.5 rounded-full border text-white border-gray-800 bg-gray-800/20">
                  Progress
                </span>
                <div className="text-right">
                  <span className="text-white font-medium">{performanceMetrics.pointsProgress.toFixed(1)}%</span>
                  <p className="text-gray-500 text-sm">completion rate</p>
                </div>
              </div>
              {renderPointsDistribution()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};