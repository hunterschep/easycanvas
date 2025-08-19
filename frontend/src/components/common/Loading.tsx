import React from 'react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  fullScreen = true 
}) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center text-white
      ${fullScreen ? 'fixed inset-0 z-50' : 'w-full h-full min-h-[200px]'}`}
    >
      <div className="relative w-full max-w-md mx-auto px-4">
        {/* Main loading container with glassmorphism */}
        <div className="relative">
          {/* Animated background blur */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          
          {/* Logo and loading indicator */}
          <div className="glass p-8 flex flex-col items-center space-y-6">
            {/* Animated logo */}
            <div className="relative">
              <h1 className="text-3xl sm:text-4xl font-black glass-text-primary tracking-tighter">
                easy<span className="glass-text-secondary">canvas</span>
              </h1>
              
              {/* Animated bottom line */}
              <div className="mt-2 h-0.5 w-full bg-white/20 relative overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/80 to-white/40 animate-shimmer"></div>
              </div>
            </div>
            
            {/* Loading animation - a modern gradient bar */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-white/60 via-white to-white/60 animate-progress"></div>
            </div>
            
            {/* Message with fade-in effect */}
            <p className="glass-text-secondary text-sm animate-pulse">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 