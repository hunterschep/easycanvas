import { Account } from '@/features/account/components/Account/Account';
import { Button } from '@/components/common/Button/Button';

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
                <Button
                  onClick={onBack}
                  variant="secondary"
                  size="sm"
                >
                  ← Back
                </Button>
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