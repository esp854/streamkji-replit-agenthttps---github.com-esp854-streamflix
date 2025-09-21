import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center border border-red-500/30">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Oups, quelque chose s'est mal passé</h2>
            <p className="text-gray-300 mb-6">
              Une erreur inattendue s'est produite. Veuillez rafraîchir la page ou réessayer plus tard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;