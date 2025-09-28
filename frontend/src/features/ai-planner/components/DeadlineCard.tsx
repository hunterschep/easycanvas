import { CalendarDaysIcon, ExclamationTriangleIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/outline';
import type { DeadlineItem } from '../services/ai-planner.service';

interface DeadlineCardProps {
  deadline: DeadlineItem;
}

export const DeadlineCard = ({ deadline }: DeadlineCardProps) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent': 
        return {
          color: 'text-red-400',
          bgColor: 'bg-[rgba(239,68,68,0.08)]',
          borderColor: 'border-red-500/30',
          icon: <ExclamationTriangleIcon className="w-4 h-4" />
        };
      case 'important': 
        return {
          color: 'text-orange-400',
          bgColor: 'bg-[rgba(249,115,22,0.08)]',
          borderColor: 'border-orange-500/30',
          icon: <ClockIcon className="w-4 h-4" />
        };
      default: 
        return {
          color: 'text-blue-400',
          bgColor: 'bg-[rgba(59,130,246,0.08)]',
          borderColor: 'border-blue-500/30',
          icon: <CalendarDaysIcon className="w-4 h-4" />
        };
    }
  };

  const config = getPriorityConfig(deadline.priority);
  const daysUntilDue = Math.ceil((new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const formatDaysUntil = (days: number) => {
    if (days === 0) return 'Due Today';
    if (days === 1) return 'Due Tomorrow';
    if (days < 0) return `${Math.abs(days)} days overdue`;
    return `${days} days left`;
  };

  return (
    <div className="relative group/card">
      {/* Card gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 rounded-[var(--radius-lg)] blur opacity-0 group-hover/card:opacity-40 transition duration-500" />
      
      <div className="relative glass p-4 hover:bg-[rgba(17,25,40,0.16)] transition-all duration-300">
        <div className="flex items-start gap-3">
          {/* Priority Icon */}
          <div className={`flex-shrink-0 p-2 rounded-xl border ${config.borderColor} ${config.bgColor} ${config.color}`}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold glass-text-primary leading-tight">
                {deadline.title}
              </h3>
              
              {/* Course Badge */}
              <div className="px-2 py-1 glass-chip text-xs font-medium">
                {deadline.course}
              </div>
            </div>

            {deadline.description && (
              <p className="text-sm glass-text-secondary mb-3 leading-relaxed">
                {deadline.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs glass-text-secondary">
                <div className="flex items-center gap-1">
                  <CalendarDaysIcon className="w-3 h-3" />
                  <span>{new Date(deadline.dueDate).toLocaleDateString()}</span>
                </div>
                
                {deadline.points && (
                  <div className="flex items-center gap-1">
                    <TrophyIcon className="w-3 h-3 text-yellow-400" />
                    <span>{deadline.points} pts</span>
                  </div>
                )}
              </div>
              
              {/* Days Until Due */}
              <div className={`text-xs font-medium px-2 py-1 rounded-full border ${config.borderColor} ${config.bgColor} ${config.color}`}>
                {formatDaysUntil(daysUntilDue)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
