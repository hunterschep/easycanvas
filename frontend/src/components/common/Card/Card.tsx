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
    default: 'from-white via-gray-500 to-black',
    blue: 'from-blue-500 via-purple-500 to-blue-600',
    purple: 'from-purple-500 via-pink-500 to-purple-600',
    green: 'from-green-500 via-emerald-500 to-green-600',
    red: 'from-red-500 via-pink-500 to-red-600',
    yellow: 'from-yellow-500 via-orange-500 to-yellow-600'
  };

  if (loading) {
    return (
      <div className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradientStyles[variant]} rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200`} />
        <div className={`relative bg-black border border-gray-800 rounded-xl ${sizeStyles[size]}`}>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-800 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div 
        className={`absolute -inset-0.5 bg-gradient-to-r ${gradientStyles[variant]} rounded-xl blur opacity-30 ${
          hover ? 'group-hover:opacity-100 transition duration-1000 group-hover:duration-200' : ''
        }`} 
      />
      <div 
        className={`relative bg-black border border-gray-800 rounded-xl ${sizeStyles[size]} ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

// Convenience components for common card patterns
export const SectionCard = ({ children, title, icon, className = '', ...props }: 
  CardProps & { title?: string; icon?: ReactNode }) => (
  <Card className={className} {...props}>
    {(title || icon) && (
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        {icon && (
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-full p-3">
            {icon}
          </div>
        )}
        {title && (
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-white">
            {title}
          </h2>
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
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-full p-3">
            {icon}
          </div>
        </div>
      )}
      <div>
        <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
        <p className="text-xs sm:text-sm text-gray-400">{label}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  </Card>
);
