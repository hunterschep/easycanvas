import { useState } from 'react';
import { CheckCircleIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import type { TodoItem } from '../services/ai-planner.service';

interface TodoCardProps {
  todo: TodoItem;
  onToggle: (id: string) => void;
}

export const TodoCard = ({ todo, onToggle }: TodoCardProps) => {
  const [isCompleted, setIsCompleted] = useState(todo.completed);

  const handleToggle = () => {
    setIsCompleted(!isCompleted);
    onToggle(todo.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 bg-[rgba(239,68,68,0.08)] text-red-400';
      case 'medium': return 'border-yellow-500/30 bg-[rgba(234,179,8,0.08)] text-yellow-400';
      case 'low': return 'border-green-500/30 bg-[rgba(34,197,94,0.08)] text-green-400';
      default: return 'border-gray-500/30 bg-[rgba(107,114,128,0.08)] text-gray-400';
    }
  };

  return (
    <div className={`relative group/card transition-all duration-300 ${isCompleted ? 'opacity-60' : ''}`}>
      {/* Card gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-[var(--radius-lg)] blur opacity-0 group-hover/card:opacity-40 transition duration-500" />
      
      <div className="relative glass p-4 hover:bg-[rgba(17,25,40,0.16)] transition-all duration-300">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleToggle}
            className="flex-shrink-0 mt-1 transition-colors duration-200"
          >
            {isCompleted ? (
              <CheckCircleIconSolid className="w-5 h-5 text-green-400" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-gray-400 hover:text-green-400" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={`font-semibold glass-text-primary leading-tight ${isCompleted ? 'line-through' : ''}`}>
                {todo.title}
              </h3>
              
              {/* Priority Badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                {todo.priority}
              </div>
            </div>

            <p className="text-sm glass-text-secondary mb-3 leading-relaxed">
              {todo.description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs glass-text-secondary">
              {todo.course && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>{todo.course}</span>
                </div>
              )}
              
              {todo.estimatedTime && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>{todo.estimatedTime}</span>
                </div>
              )}
              
              {todo.dueDate && (
                <div className="flex items-center gap-1">
                  <CalendarDaysIcon className="w-3 h-3" />
                  <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
