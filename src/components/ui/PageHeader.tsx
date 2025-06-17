import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backButton?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  backButton,
  className = '',
  variant = 'default'
}) => {
  const titleSize = variant === 'compact' ? 'text-xl' : 'text-page-title';
  const spacing = variant === 'compact' ? 'space-y-2' : 'space-y-4';

  return (
    <div className={`${spacing} ${className}`}>
      {backButton && (
        <div className="mb-4">
          {backButton}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className={`${titleSize} font-bold text-white`}>
            {title}
          </h1>
          {description && (
            <p className="text-slate-400 text-body-regular mt-1">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex flex-col sm:flex-row gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader; 