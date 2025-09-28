import { BookOpenIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { StudyBlock } from '../services/ai-planner.service';

interface StudyBlockCardProps {
  studyBlock: StudyBlock;
}

export const StudyBlockCard = ({ studyBlock }: StudyBlockCardProps) => {
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': 
        return {
          color: 'text-red-400',
          bgColor: 'bg-[rgba(239,68,68,0.06)]',
          borderColor: 'border-red-500/20'
        };
      case 'medium': 
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-[rgba(234,179,8,0.06)]',
          borderColor: 'border-yellow-500/20'
        };
      default: 
        return {
          color: 'text-green-400',
          bgColor: 'bg-[rgba(34,197,94,0.06)]',
          borderColor: 'border-green-500/20'
        };
    }
  };

  const config = getDifficultyConfig(studyBlock.difficulty);

  return (
    <div className="relative group/card">
      {/* Card gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-[var(--radius-lg)] blur opacity-0 group-hover/card:opacity-40 transition duration-500" />
      
      <div className="relative glass p-4 hover:bg-[rgba(17,25,40,0.16)] transition-all duration-300">
        <div className="flex items-start gap-3">
          {/* Study Icon */}
          <div className="flex-shrink-0 p-2 rounded-xl border border-purple-500/30 bg-[rgba(147,51,234,0.08)] text-purple-400">
            <BookOpenIcon className="w-4 h-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold glass-text-primary leading-tight">
                {studyBlock.title}
              </h3>
              
              {/* Course Badge */}
              <div className="px-2 py-1 glass-chip text-xs font-medium">
                {studyBlock.course}
              </div>
            </div>

            {/* Topics */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {studyBlock.topics.map((topic, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs glass-chip bg-[rgba(59,130,246,0.06)] border border-blue-500/20 text-blue-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs glass-text-secondary">
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>{studyBlock.duration}</span>
                </div>
              </div>
              
              {/* Difficulty Badge */}
              <div className={`text-xs font-medium px-2 py-1 rounded-full border ${config.borderColor} ${config.bgColor} ${config.color}`}>
                {studyBlock.difficulty} level
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
