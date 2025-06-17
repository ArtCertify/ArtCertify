import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  variant = 'default'
}) => {
  const defaultIcon = (
    <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const iconSize = variant === 'compact' ? 'w-16 h-16' : 'w-24 h-24';
  const iconInnerSize = variant === 'compact' ? 'w-8 h-8' : 'w-12 h-12';
  const titleSize = variant === 'compact' ? 'text-lg' : 'text-xl';
  const padding = variant === 'compact' ? 'py-8' : 'py-12';

  return (
    <div className={`text-center ${padding} ${className}`}>
      <div className={`${iconSize} mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center`}>
        {icon ? (
          <div className={`${iconInnerSize} text-slate-500`}>
            {icon}
          </div>
        ) : (
          defaultIcon
        )}
      </div>
      
      <h3 className={`${titleSize} font-semibold text-white mb-2`}>
        {title}
      </h3>
      
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState; 