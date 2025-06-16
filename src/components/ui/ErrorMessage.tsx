import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = 'Errore nel caricamento',
  message, 
  onRetry,
  className = '' 
}) => {
  return (
    <div className={`bg-red-900/20 border border-red-800 rounded-lg p-4 sm:p-6 ${className}`}>
      <div className="flex items-start">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-red-400 font-medium text-sm sm:text-base">{title}</h3>
          <p className="text-red-300 text-xs sm:text-sm mt-1 break-words">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center px-3 py-1.5 border border-red-600 text-xs font-medium rounded text-red-300 bg-red-900/30 hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Riprova
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage; 