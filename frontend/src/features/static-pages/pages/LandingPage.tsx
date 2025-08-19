import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button/Button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { 
  SparklesIcon, 
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser, hasCanvasToken } = useAuth();

  const schoolLogos = [
    { name: "Boston College", logo: "/schools/bostoncollege.png" },
    { name: "Northeastern University", logo: "/schools/northeastern.png" },
    { name: "University of Massachusetts Amherst", logo: "/schools/umass.png" },
    { name: "University of Washington", logo: "/schools/uw.png" },
    { name: "Purdue University", logo: "/schools/purdue.png" },
    { name: "University of Michigan", logo: "/schools/michigan.png" },
    { name: "Rice University", logo: "/schools/rice.png" },
    { name: "University of California, Berkeley", logo: "/schools/berkeley.png" },
    { name: "University of Southern California", logo: "/schools/usc.png" },
    { name: "Washington State University", logo: "/schools/wsu.jpg" },
    { name: "University of California, Los Angeles", logo: "/schools/ucla.png" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="z-50 glass-elevated sticky top-0 mx-4 mt-4 border-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter glass-text-primary">
                easy<span className="glass-text-secondary">canvas</span>
              </h1>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              {currentUser ? (
                // Logged in user - show dashboard link
                <Button
                  onClick={() => navigate(hasCanvasToken ? '/home' : '/setup')}
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRightIcon className="w-4 h-4" />}
                >
                  Go to Dashboard
                </Button>
              ) : (
                // Not logged in - show auth buttons
                <>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="secondary"
                    size="md"
                    className="hidden sm:inline-flex"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRightIcon className="w-4 h-4" />}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 -left-20 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-gray-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Grid Layout for Visual Interest */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[70vh]">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-7 xl:col-span-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 glass-chip px-4 py-2 mb-6">
                <SparklesIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium glass-text-primary">Trusted by 500+ students</span>
              </div>

              {/* Canvas LMS Problem Statement */}
              <div className="mb-8">
                <p className="text-xl sm:text-2xl lg:text-3xl glass-text-secondary mb-3 leading-tight">
                  Canvas LMS <span className="text-red-400 font-bold">sucks</span>
                </p>
                <p className="text-lg sm:text-xl glass-text-secondary">
                  But it doesn't have to.
                </p>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                <span className="glass-text-primary">Your AI-Powered</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-gray-300 to-blue-400 bg-clip-text text-transparent">
                  Academic Assistant
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl glass-text-secondary mb-10 leading-relaxed max-w-lg">
                Transform your Canvas experience with AI that understands your courses, 
                tracks your progress, and helps you succeed academically.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {currentUser ? (
                  // Logged in user - show dashboard access
                  <Button
                    onClick={() => navigate(hasCanvasToken ? '/home' : '/setup')}
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRightIcon className="w-5 h-5" />}
                    className="text-lg px-8 py-4"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  // Not logged in - show auth CTAs
                  <>
                    <Button
                      onClick={() => navigate('/login')}
                      variant="primary"
                      size="lg"
                      rightIcon={<ArrowRightIcon className="w-5 h-5" />}
                      className="text-lg px-8 py-4"
                    >
                      Start Free Today
                    </Button>
                    <Button
                      onClick={() => navigate('/login')}
                      variant="secondary"
                      size="lg"
                      className="text-lg px-8 py-4"
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>

              {/* Social Proof */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  <span>Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  <span>Setup in under 2 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  <span>Secure and private</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="lg:col-span-5 xl:col-span-6 flex items-center justify-center lg:justify-end">
              <div className="relative">
                {/* Floating UI Preview Card */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-gray-500/20 to-blue-500/20 rounded-[var(--radius-glass)] blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative glass p-6 lg:p-8 max-w-md">
                    {/* Mock Chat Interface */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <SparklesIcon className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">AI Assistant</p>
                          <p className="text-gray-500 text-xs">Online</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="glass-chip rounded-lg p-3 text-sm glass-text-primary">
                          "When is my Biology assignment due?"
                        </div>
                        <div className="glass-chip border border-blue-500/30 bg-[rgba(59,130,246,0.08)] rounded-lg p-3 text-sm glass-text-primary">
                          Your Biology lab report is due tomorrow at 11:59 PM. You have 2 questions left to complete.
                        </div>
                        <div className="glass-chip rounded-lg p-3 text-sm glass-text-primary">
                          "Help me study for the midterm"
                        </div>
                        <div className="glass-chip border border-blue-500/30 bg-[rgba(59,130,246,0.08)] rounded-lg p-3 text-sm glass-text-primary">
                          I've created a personalized study plan based on your course materials...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute -top-4 -left-4 glass-chip p-3">
                  <div className="text-center">
                    <p className="text-green-400 font-bold text-lg">98%</p>
                    <p className="glass-text-secondary text-xs">Success Rate</p>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 glass-chip p-3">
                  <div className="text-center">
                    <p className="text-blue-400 font-bold text-lg">24/7</p>
                    <p className="glass-text-secondary text-xs">Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* School Logos Carousel - Full Width Bottom */}
        <div className="relative mt-16 lg:mt-20">
          <div className="text-center mb-8">
            <p className="text-lg text-gray-500 font-medium">
              Loved by students at
            </p>
          </div>

          {/* Carousel Container with Fade Masks */}
          <div className="relative overflow-hidden mask-gradient h-32">
            <div 
              className="flex animate-carousel gap-8 lg:gap-12 w-max"
              style={{
                animation: 'carousel-scroll 40s linear infinite',
                willChange: 'transform'
              }}
            >
              {/* First set */}
              {schoolLogos.map((school, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 flex flex-col items-center gap-3 p-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 lg:w-16 lg:h-16 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                    <img 
                      src={school.logo} 
                      alt={`${school.name} logo`}
                      className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-gray-300 text-center whitespace-nowrap transition-colors duration-300">
                    {school.name}
                  </span>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {schoolLogos.map((school, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 flex flex-col items-center gap-3 p-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 lg:w-16 lg:h-16 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                    <img 
                      src={school.logo} 
                      alt={`${school.name} logo`}
                      className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-gray-300 text-center whitespace-nowrap transition-colors duration-300">
                    {school.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
