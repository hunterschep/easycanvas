import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button/Button';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: 'AI Assignment Analysis',
      description: 'Get smart summaries and deadline predictions that Canvas doesn\'t offer',
      icon: '🤖'
    },
    {
      title: 'Distraction-Free Interface',
      description: 'A cleaner, faster alternative to Canvas\'s cluttered dashboard',
      icon: '✨'
    },
    {
      title: 'Intelligent Prioritization',
      description: 'Focus on what matters with AI-powered task ranking, unlike standard Canvas',
      icon: '📊'
    }
  ];

  const testimonials = [
    {
      text: "easyCanvas saved me hours of time navigating through assignments.",
      author: "Computer Science Student"
    },
    {
      text: "The AI assistant helped me never miss a deadline again!",
      author: "Business Major"
    },
    {
      text: "So much cleaner than regular Canvas. I can actually find what I need now.",
      author: "Education Student"
    }
  ];

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-40 right-20 w-60 h-60 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-6000"></div>

      {/* Hero Section - Enhanced */}
      <div className="flex flex-col items-center justify-center px-4 py-16 md:py-28 lg:py-32">
        <div className="text-center space-y-6 max-w-4xl">
          <div className="inline-block px-4 py-1 mb-4 rounded-full bg-gray-900/70 border border-gray-800">
            <span className="text-sm text-gray-400">Canvas made simple, powerful, and intelligent</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter leading-tight">
            Canvas, but <span className="bg-gradient-to-r from-gray-100 to-gray-400 inline-block text-transparent bg-clip-text">smarter</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 font-light max-w-2xl mx-auto">
            Skip the Canvas clutter. Get straight to what matters with our AI-powered Canvas assistant.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={goToLogin}
              className="justify-center bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-800 text-white border border-gray-700 hover:border-gray-500 hover:shadow-lg hover:shadow-gray-900/20 transition-all duration-300 py-3 px-8 transform hover:translate-y-[-2px]"
            >
              Get Started
            </Button>
            <Button 
              onClick={goToLogin}
              variant="secondary"
              className="justify-center bg-transparent hover:bg-gray-900 text-gray-300 hover:text-white border border-gray-800 hover:border-gray-600 transition-all duration-300 py-3 px-8 transform hover:translate-y-[-2px]"
            >
              Login
            </Button>
          </div>
        </div>
      </div>

      {/* Why Canvas is Frustrating Section - New */}
      <div className="w-full px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6 order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Canvas LMS <span className="text-red-500">frustrations</span>, solved
              </h2>
              <p className="text-gray-400">
                Traditional Canvas is powerful but often overwhelming. easyCanvas strips away the complexity while enhancing what matters.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-gray-900/30 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 group">
                  <div className="mt-1 text-red-500">✗</div>
                  <div>
                    <span className="text-gray-300 font-medium">Cluttered Canvas Interface</span>
                    <p className="text-sm text-gray-500">Too many clicks to find what you need</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-900/30 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 group">
                  <div className="mt-1 text-red-500">✗</div>
                  <div>
                    <span className="text-gray-300 font-medium">Hidden important deadlines</span>
                    <p className="text-sm text-gray-500">Easy to miss critical assignments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-900/30 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 group">
                  <div className="mt-1 text-red-500">✗</div>
                  <div>
                    <span className="text-gray-300 font-medium">No smart filtering</span>
                    <p className="text-sm text-gray-500">Everything has equal priority</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl transform rotate-1 hover:rotate-0 transition-all duration-500">
                <div className="aspect-video bg-gray-900 flex items-center justify-center p-6">
                  <div className="w-full text-center space-y-4">
                    <p className="text-gray-500 text-xs uppercase tracking-wider">TRADITIONAL CANVAS</p>
                    <div className="border border-gray-800 rounded-lg p-4 bg-gray-950/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-3 w-24 bg-gray-800 rounded"></div>
                        <div className="h-3 w-12 bg-gray-800 rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-800 rounded w-full"></div>
                        <div className="h-2 bg-gray-800 rounded w-5/6"></div>
                        <div className="h-2 bg-gray-800 rounded w-4/6"></div>
                      </div>
                    </div>
                    <p className="text-red-500 text-sm">Cluttered. Confusing. Inefficient.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section - Enhanced */}
      <div className="w-full px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
            How <span className="bg-gradient-to-r from-gray-200 to-gray-500 inline-block text-transparent bg-clip-text">easyCanvas</span> improves your workflow
          </h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-16">
            Our intelligent tools transform how you interact with Canvas, saving time and reducing stress.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="relative group bg-gradient-to-b from-gray-900/20 to-black p-8 rounded-xl border border-gray-800 hover:border-gray-600 transition-all duration-300 transform hover:translate-y-[-4px] hover:shadow-xl hover:shadow-gray-900/30"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/0 to-gray-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-gray-500 to-gray-700 transition-all duration-500 ease-out ${activeFeature === index ? 'w-full' : 'w-0'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Section - Enhanced */}
      <div className="w-full px-4 py-16 md:py-24 bg-gradient-to-b from-black to-gray-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                What makes us <span className="bg-gradient-to-r from-gray-200 to-gray-500 inline-block text-transparent bg-clip-text">better</span> than Canvas
              </h2>
              <p className="text-gray-400">
                easyCanvas provides a streamlined interface with AI smarts that the original Canvas LMS simply doesn't offer.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group">
                  <span className="mt-1 text-gray-300 group-hover:text-white transition-colors duration-300">✓</span>
                  <div>
                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">AI-powered deadline prioritization</span>
                    <p className="text-sm text-gray-500">Automatically suggests what to work on first</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="mt-1 text-gray-300 group-hover:text-white transition-colors duration-300">✓</span>
                  <div>
                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">Dark mode optimized interface</span>
                    <p className="text-sm text-gray-500">Modern design that's easier on your eyes</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="mt-1 text-gray-300 group-hover:text-white transition-colors duration-300">✓</span>
                  <div>
                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">Assignment content summaries</span>
                    <p className="text-sm text-gray-500">Quick overviews so you know what you're getting into</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="mt-1 text-gray-300 group-hover:text-white transition-colors duration-300">✓</span>
                  <div>
                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">Mobile-optimized experience</span>
                    <p className="text-sm text-gray-500">Works perfectly on all your devices</p>
                  </div>
                </li>
              </ul>
              <Button 
                onClick={goToLogin}
                className="mt-4 justify-center bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-800 text-white border border-gray-700 hover:border-gray-500 hover:shadow-lg hover:shadow-gray-900/20 transition-all duration-300 py-3 px-8 transform hover:translate-y-[-2px]"
              >
                Try It Now
              </Button>
            </div>
            <div className="md:w-1/2 rounded-xl overflow-hidden border border-gray-800 shadow-2xl transform hover:scale-[1.01] transition-all duration-500">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="w-full max-w-sm mx-auto p-4">
                  <div className="mb-6 space-y-2">
                    <div className="h-8 w-48 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg mx-auto"></div>
                    <div className="h-4 w-32 bg-gray-800 rounded mx-auto"></div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 border border-gray-800 rounded-lg bg-black/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex-shrink-0"></div>
                      <div className="flex-grow space-y-1">
                        <div className="h-3 w-24 bg-gradient-to-r from-gray-700 to-gray-600 rounded"></div>
                        <div className="h-2 w-32 bg-gray-800 rounded"></div>
                      </div>
                      <div className="h-6 w-12 rounded bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-800/50"></div>
                    </div>
                    
                    <div className="p-4 border border-gray-800 rounded-lg bg-black/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex-shrink-0"></div>
                      <div className="flex-grow space-y-1">
                        <div className="h-3 w-32 bg-gradient-to-r from-gray-700 to-gray-600 rounded"></div>
                        <div className="h-2 w-24 bg-gray-800 rounded"></div>
                      </div>
                      <div className="h-6 w-12 rounded bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-800/50"></div>
                    </div>
                    
                    <div className="p-4 border border-gray-800 rounded-lg bg-gradient-to-r from-gray-900/50 to-black/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex-shrink-0"></div>
                      <div className="flex-grow space-y-1">
                        <div className="h-3 w-28 bg-gradient-to-r from-gray-700 to-gray-600 rounded"></div>
                        <div className="h-2 w-20 bg-gray-800 rounded"></div>
                      </div>
                      <div className="h-6 w-12 rounded bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-800/50"></div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-sm text-gray-500">easyCanvas Interface</p>
                    <p className="text-xs text-gray-600">Clean. Focused. Intelligent.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials - New */}
      <div className="w-full px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            What students are saying
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-900/20 p-8 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300 flex flex-col"
              >
                <div className="text-2xl text-gray-600 mb-4">"</div>
                <p className="text-gray-300 flex-grow mb-4">{testimonial.text}</p>
                <div className="text-sm text-gray-500">— {testimonial.author}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={goToLogin}
              className="justify-center bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-800 text-white border border-gray-700 hover:border-gray-500 hover:shadow-lg hover:shadow-gray-900/20 transition-all duration-300 py-3 px-8 transform hover:translate-y-[-2px]"
            >
              Join Them Today
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full px-4 py-12 mt-auto border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-black text-white tracking-tighter">
              easy<span className="bg-gradient-to-r from-gray-200 to-gray-500 inline-block text-transparent bg-clip-text">canvas</span>
            </h2>
          </div>
          <div className="flex space-x-6">
            <a href="/terms" className="text-gray-400 hover:text-white transition-colors duration-300">Terms</a>
            <a href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy</a>
            <a href="/login" className="text-gray-400 hover:text-white transition-colors duration-300">Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}; 