import { useNavigate } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button/Button';
import { SectionCard } from '@/components/common/Card/Card';

export const EnterChat = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/chat');
  };

  const features = [
    {
      icon: <AcademicCapIcon className="w-5 h-5 text-green-400" />,
      title: "Assignment Help",
      description: "Get help with homework and projects"
    },
    {
      icon: <LightBulbIcon className="w-5 h-5 text-blue-400" />,
      title: "Course Insights",
      description: "Understand your course content better"
    },
    {
      icon: <ClockIcon className="w-5 h-5 text-purple-400" />,
      title: "Study Planning",
      description: "Create effective study schedules"
    }
  ];

  return (
    <SectionCard 
      title="AI Chat Assistant"
      icon={<SparklesIcon className="w-8 h-8 text-blue-400" />}
      variant="blue"
      size="lg"
    >
      <div className="space-y-6">
        {/* Compact Header */}
        <div className="-mt-2 sm:-mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-1">
                <span className="text-xs font-medium text-blue-400">GPT-4</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Online</span>
              </div>
            </div>
          </div>
          <p className="text-gray-300 text-base leading-relaxed">
            Your personal academic AI assistant for courses, assignments, and study strategies
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Left Content - Features */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="bg-gray-800/50 rounded-full p-2">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{feature.title}</h4>
                      <p className="text-gray-400 text-xs mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick Examples */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
              <h4 className="text-white font-medium mb-2 flex items-center space-x-2 text-sm">
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-400" />
                <span>Try asking:</span>
              </h4>
              <div className="space-y-1 text-xs text-gray-300">
                <p>"What assignments are due this week?"</p>
                <p>"Help me understand this course material"</p>
                <p>"Create a study plan for my exams"</p>
              </div>
            </div>
          </div>

          {/* Right CTA */}
          <div className="flex-shrink-0 flex flex-col items-center space-y-3">
            <Button
              onClick={handleStartChat}
              variant="primary"
              size="lg"
              rightIcon={<ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />}
              className="px-6 py-3"
            >
              Start Chat
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Available 24/7
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}; 