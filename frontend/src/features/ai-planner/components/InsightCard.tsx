import { 
  LightBulbIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button/Button';
import type { InsightCard as InsightCardType } from '../services/ai-planner.service';

interface InsightCardProps {
  insight: InsightCardType;
}

export const InsightCard = ({ insight }: InsightCardProps) => {
  const getInsightConfig = (type: string) => {
    switch (type) {
      case 'tip': 
        return {
          icon: <LightBulbIcon className="w-5 h-5" />,
          color: 'text-yellow-400',
          bgColor: 'bg-[rgba(234,179,8,0.08)]',
          borderColor: 'border-yellow-500/30'
        };
      case 'warning': 
        return {
          icon: <ExclamationTriangleIcon className="w-5 h-5" />,
          color: 'text-red-400',
          bgColor: 'bg-[rgba(239,68,68,0.08)]',
          borderColor: 'border-red-500/30'
        };
      case 'success': 
        return {
          icon: <CheckCircleIcon className="w-5 h-5" />,
          color: 'text-green-400',
          bgColor: 'bg-[rgba(34,197,94,0.08)]',
          borderColor: 'border-green-500/30'
        };
      default: 
        return {
          icon: <InformationCircleIcon className="w-5 h-5" />,
          color: 'text-blue-400',
          bgColor: 'bg-[rgba(59,130,246,0.08)]',
          borderColor: 'border-blue-500/30'
        };
    }
  };

  const config = getInsightConfig(insight.type);

  return (
    <div className="relative group/card">
      {/* Card gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 via-green-500/20 to-blue-500/20 rounded-[var(--radius-lg)] blur opacity-0 group-hover/card:opacity-40 transition duration-500" />
      
      <div className={`relative glass p-4 hover:bg-[rgba(17,25,40,0.16)] transition-all duration-300 border ${config.borderColor} ${config.bgColor}`}>
        <div className="flex items-start gap-3">
          {/* Insight Icon */}
          <div className={`flex-shrink-0 ${config.color}`}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold mb-2 leading-tight ${config.color}`}>
              {insight.title}
            </h3>
            
            <p className="text-sm glass-text-secondary mb-3 leading-relaxed">
              {insight.message}
            </p>

            {/* Action Button */}
            {insight.action && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRightIcon className="w-3 h-3" />}
                  className={`text-xs ${config.color} hover:${config.bgColor} border-0`}
                >
                  {insight.action}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
