import { useEffect, useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, isVisible, onClose, duration = 5000 }: ToastProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const getGlassStyle = () => {
    switch (type) {
      case 'success':
        return 'glass-chip border border-green-500/30 bg-[rgba(34,197,94,0.15)]';
      case 'error':
        return 'glass-chip border border-red-500/30 bg-[rgba(239,68,68,0.15)]';
      default:
        return 'glass-chip border border-blue-500/30 bg-[rgba(59,130,246,0.15)]';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`flex items-center gap-3 p-4 ${getGlassStyle()}`}>
        {getIcon()}
        <p className="glass-text-primary text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="glass-text-secondary hover:glass-text-primary transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}; 