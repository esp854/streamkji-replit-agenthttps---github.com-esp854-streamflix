import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServerErrorProps {
  onRetry?: () => void;
  message?: string;
}

const ServerError: React.FC<ServerErrorProps> = ({ 
  onRetry, 
  message = "Une erreur serveur est survenue. Veuillez réessayer plus tard." 
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Erreur serveur</h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {onRetry && (
          <Button 
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        )}
      </div>
    </div>
  );
};

export default ServerError;