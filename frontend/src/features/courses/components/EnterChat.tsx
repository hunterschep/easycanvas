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
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      <div className="relative bg-black border border-gray-800 rounded-lg p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-4 sm:space-y-6">
            {/* Icon and Title */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50"></div>
                  <div className="relative bg-black border border-gray-700 rounded-full p-3 sm:p-4">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-white mb-2">
                  AI Chat Assistant
                </h2>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-blue-400 text-sm sm:text-base">
                  <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Powered by OpenAI's latest reasoning models</span>
                </div>
              </div>
            </div>

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
  );
}; 