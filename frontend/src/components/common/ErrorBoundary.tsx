import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/common/Button/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="relative group max-w-md w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-red-800 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-black border border-red-900/50 rounded-lg p-6 space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-red-400">Something went wrong</h2>
                <p className="text-sm text-gray-400">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <div className="mt-4 p-3 bg-black/50 border border-red-900/30 rounded overflow-auto text-xs text-gray-500">
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              )}

              <div className="flex justify-center pt-2">
                <Button
                  onClick={this.handleReset}
                  variant="danger"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 