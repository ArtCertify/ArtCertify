import React from 'react';
import Card from './Card';

interface SectionCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  icon,
  actions,
  children,
  className = '',
  padding = 'md',
  variant = 'default',
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const renderHeader = () => {
    if (!title && !description && !icon && !actions) return null;

    return (
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3 flex-1">
          {icon && (
            <div className="flex-shrink-0 text-slate-400 mt-1">
              {icon}
            </div>
          )}
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-white mb-1">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-slate-400 text-sm">
                {description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {actions}
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label={isCollapsed ? 'Espandi sezione' : 'Comprimi sezione'}
            >
              <svg 
                className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card
      className={className}
      padding={padding}
      variant={variant}
    >
      {renderHeader()}
      {(!collapsible || !isCollapsed) && (
        <div className={title || description || icon || actions ? '' : ''}>
          {children}
        </div>
      )}
    </Card>
  );
};

export default SectionCard; 