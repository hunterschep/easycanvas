import { FC } from 'react';

interface LoadingProps {
  message?: string;
}

const Loading: FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <div className="relative">
        {/* Animated gradient border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 animate-pulse"></div>
        
        {/* Content container */}
        <div className="relative bg-black p-8 rounded-lg">
          {/* Loading spinner */}
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Loading message */}
          <p className="text-white text-center font-light">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Loading; 