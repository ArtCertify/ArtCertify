import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
  hover?: boolean;
  icon?: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  variant = 'default',
  hover = false,
  icon,
  title,
  actions
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const variantClasses = {
    default: 'bg-slate-800 border border-slate-700',
    elevated: 'bg-slate-800 border border-slate-700 shadow-card',
    outlined: 'bg-transparent border border-slate-600'
  };

  const hoverClasses = hover ? 'hover:shadow-card-hover hover:border-slate-600 transition-all duration-200 cursor-pointer' : '';

  const cardClasses = `rounded-lg ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`;

  const renderHeader = () => {
    if (!title && !icon && !actions) return null;

    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0 text-slate-400">
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-subsection-title text-white">
              {title}
            </h3>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cardClasses}>
      {renderHeader()}
      <div className={title || icon || actions ? '' : ''}>
        {children}
      </div>
    </div>
  );
};

export default Card; 