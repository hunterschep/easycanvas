import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button/Button';

export const EnterChat = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/chat');
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      <div className="relative bg-black border border-gray-800 rounded-xl p-6 sm:p-8 lg:p-10">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-full p-3">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-white">
                Chat Assistant
              </h2>
              <p className="text-gray-400 text-base sm:text-lg">
                Powered by OpenAI's latest reasoning models
              </p>
            </div>
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
                variant="primary"
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  Start Chatting
                  <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 