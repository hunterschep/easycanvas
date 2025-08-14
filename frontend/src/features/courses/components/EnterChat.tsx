import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button/Button';
import { SectionCard } from '@/components/common/Card/Card';

export const EnterChat = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/chat');
  };

  return (
    <SectionCard 
      title="Chat Assistant"
      icon={<ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-400" />}
      variant="blue"
      size="lg"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Subtitle */}
        <div className="-mt-2 sm:-mt-4">
          <p className="text-gray-400 text-base sm:text-lg">
            Powered by OpenAI's latest reasoning models
          </p>
        </div>

          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-4 sm:space-y-6">
              {/* Description */}
              <div className="space-y-3 sm:space-y-4">
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Get instant help with your Canvas courses, assignments, and academic questions. 
                </p>
                
                {/* Feature highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm text-gray-400">
                  <div className="flex items-center justify-center lg:justify-start gap-2 p-2 sm:p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                    <span>Assignment Help</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 p-2 sm:p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <span>Course Insights</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 p-2 sm:p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                    <span>Study Planning</span>
                  </div>
                </div>
              </div>
            </div>

          {/* Right CTA Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={handleStartChat}
              variant="gradient"
              size="lg"
              rightIcon={<ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-200" />}
            >
              Start Chatting
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}; 