import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'blue' | 'purple' | 'green' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  loading?: boolean;
}

export const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md',
  hover = true,
  loading = false
}: CardProps) => {
  const sizeStyles = {
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-8',
    lg: 'p-6 sm:p-8 lg:p-10'
  };

  const gradientStyles = {
    default: 'from-gray-600/80 via-gray-600/90 to-gray-600/80',
    blue: 'from-blue-600/80 via-blue-600/90 to-blue-600/80', 
    purple: 'from-purple-600/80 via-purple-600/90 to-purple-600/80',
    green: 'from-green-600/80 via-green-600/90 to-green-600/80',
    red: 'from-red-600/80 via-red-600/90 to-red-600/80',
    yellow: 'from-yellow-600/80 via-yellow-600/90 to-yellow-600/80'
  };

  if (loading) {
    return (
      <div className="relative group">
        <div 
          className={`absolute -inset-1 bg-gradient-to-r ${gradientStyles[variant]} rounded-[calc(var(--radius-lg)+4px)] blur-sm opacity-15`}
          style={{
            filter: 'blur(8px) saturate(1.2)'
          }}
        />
        <div className={`relative glass ${sizeStyles[size]}`}>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/10 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Subtle glow effect for glass cards */}
      <div 
        className={`absolute -inset-1 bg-gradient-to-r ${gradientStyles[variant]} rounded-[calc(var(--radius-lg)+4px)] blur-sm opacity-15 ${
          hover ? 'group-hover:opacity-25 transition-opacity duration-700' : ''
        }`} 
        style={{
          filter: 'blur(8px) saturate(1.2)',
          willChange: hover ? 'opacity' : 'auto'
        }}
      />
      <div 
        className={`relative glass ${sizeStyles[size]} ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

// Convenience components for common card patterns
export const SectionCard = ({ children, title, icon, action, className = '', ...props }: 
  CardProps & { title?: string; icon?: ReactNode; action?: ReactNode }) => (
  <Card className={className} {...props}>
    {(title || icon || action) && (
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="glass-chip p-3 rounded-full">
              {icon}
            </div>
          )}
          {title && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter glass-text-primary">
              {title}
            </h2>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    )}
    {children}
  </Card>
);

export const StatCard = ({ value, label, icon, trend, className = '', ...props }: 
  CardProps & { 
    value: string | number; 
    label: string; 
    icon?: ReactNode; 
    trend?: { value: string; positive: boolean };
  }) => (
  <Card size="sm" className={`text-center ${className}`} {...props}>
    <div className="space-y-3">
      {icon && (
        <div className="flex justify-center">
          <div className="glass-chip p-3 rounded-full">
            {icon}
          </div>
        </div>
      )}
      <div>
        <p className="text-2xl sm:text-3xl font-bold glass-text-primary">{value}</p>
        <p className="text-xs sm:text-sm glass-text-secondary">{label}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  </Card>
);
