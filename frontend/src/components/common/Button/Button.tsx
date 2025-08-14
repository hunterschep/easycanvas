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
    primary: "text-white bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800 focus:ring-gray-500",
    secondary: "text-gray-400 hover:text-white bg-transparent border border-gray-800 hover:border-gray-600 hover:bg-gray-900/50 focus:ring-gray-500",
    danger: "text-red-400 hover:text-red-300 bg-red-900/20 border border-red-900/50 hover:border-red-700 hover:bg-red-900/30 focus:ring-red-500",
    success: "text-green-400 hover:text-green-300 bg-green-900/20 border border-green-900/50 hover:border-green-700 hover:bg-green-900/30 focus:ring-green-500",
    gradient: "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105",
    ghost: "text-gray-400 hover:text-white bg-transparent border-0 hover:bg-gray-900/50 focus:ring-gray-500"
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