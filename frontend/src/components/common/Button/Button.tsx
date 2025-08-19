interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'gradient' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  children, 
  className = '', 
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm sm:text-base rounded-lg gap-2", 
    lg: "px-6 py-3 text-base sm:text-lg rounded-xl gap-2.5"
  };

  const variantStyles = {
    primary: "glass-text-primary bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-500 border-0 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-transform duration-200",
    secondary: "glass-text-primary glass-chip hover:bg-[rgba(17,25,40,0.12)] focus:ring-white/20",
    danger: "glass-text-primary glass-chip border border-red-500/30 bg-[rgba(239,68,68,0.15)] hover:bg-[rgba(239,68,68,0.25)] focus:ring-red-500/30",
    success: "glass-text-primary glass-chip border border-green-500/30 bg-[rgba(34,197,94,0.15)] hover:bg-[rgba(34,197,94,0.25)] focus:ring-green-500/30",
    gradient: "glass-text-primary bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-500 border-0 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-transform duration-200",
    ghost: "glass-text-secondary hover:glass-text-primary bg-transparent border-0 hover:bg-[rgba(17,25,40,0.08)] focus:ring-white/10"
  };

  const widthStyles = fullWidth ? "w-full" : "";

  const isDisabled = disabled || isLoading;

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      
      {children}
      
      {!isLoading && rightIcon}
    </button>
  );
}; 