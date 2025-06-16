import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

interface AlertProps {
  children: React.ReactNode;
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant,
  title,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const variantConfig = {
    success: {
      containerClasses: 'bg-success-50 border-success-200 text-success-800',
      darkContainerClasses: 'bg-success-900/20 border-success-500/30 text-success-300',
      iconClasses: 'text-success-500',
      icon: CheckCircleIcon,
      titleClasses: 'text-success-800 dark:text-success-300'
    },
    error: {
      containerClasses: 'bg-error-50 border-error-200 text-error-800',
      darkContainerClasses: 'bg-error-900/20 border-error-500/30 text-error-300',
      iconClasses: 'text-error-500',
      icon: XCircleIcon,
      titleClasses: 'text-error-800 dark:text-error-300'
    },
    warning: {
      containerClasses: 'bg-warning-50 border-warning-200 text-warning-800',
      darkContainerClasses: 'bg-warning-900/20 border-warning-500/30 text-warning-300',
      iconClasses: 'text-warning-500',
      icon: ExclamationTriangleIcon,
      titleClasses: 'text-warning-800 dark:text-warning-300'
    },
    info: {
      containerClasses: 'bg-info-50 border-info-200 text-info-800',
      darkContainerClasses: 'bg-info-900/20 border-info-500/30 text-info-300',
      iconClasses: 'text-info-500',
      icon: InformationCircleIcon,
      titleClasses: 'text-info-800 dark:text-info-300'
    }
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div className={`border rounded-lg p-4 ${config.darkContainerClasses} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${config.iconClasses}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleClasses} mb-1`}>
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.iconClasses} hover:${config.iconClasses}/80`}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert; 