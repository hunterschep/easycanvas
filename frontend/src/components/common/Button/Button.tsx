interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  isLoading, 
  children, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = "px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2";
  const variantStyles = {
    primary: "text-white border border-gray-800 hover:border-gray-600 hover:text-white",
    secondary: "text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600",
    danger: "text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700"
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}; 