import { Account } from '@/features/account/components/Account/Account';

interface MainLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
  backText?: string;
}

export const MainLayout = ({ 
  children, 
  showBackButton, 
  onBack,
  title 
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-all duration-200"
                >
                  ← Back
                </button>
              )}
              <h1 className="text-2xl font-black tracking-tighter">
                easy<span className="text-gray-500">canvas</span>
              </h1>
            </div>
            <Account />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && <h1 className="text-3xl font-bold mb-8">{title}</h1>}
        {children}
      </main>
    </div>
  );
}; 