import React from 'react';

interface InfoFieldProps {
  label: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
  copyable?: boolean;
  href?: string;
  placeholder?: string;
  fullWidth?: boolean;
}

const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  icon,
  className = '',
  variant = 'default',
  copyable = false,
  href,
  placeholder = 'Non specificato',
  fullWidth = false
}) => {
  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value);
    }
  };

  const renderValue = () => {
    if (!value) {
      return <span className="text-slate-500">{placeholder}</span>;
    }

    if (href) {
      return (
        <a 
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline break-all"
        >
          {value}
        </a>
      );
    }

    if (copyable && typeof value === 'string') {
      return (
        <div className="flex items-center gap-2">
          <span className="break-all">{value}</span>
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-white transition-colors"
            title="Copia"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      );
    }

    return <span className="break-all">{value}</span>;
  };

  const containerClasses = fullWidth ? 'col-span-full' : '';
  
  if (variant === 'inline') {
    return (
      <div className={`flex justify-between items-center ${containerClasses} ${className}`}>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
          {icon}
          {label}:
        </div>
        <div className="text-sm text-slate-300">
          {renderValue()}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`${containerClasses} ${className}`}>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          {icon}
          {label}
        </div>
        <div className="text-sm text-slate-300">
          {renderValue()}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`${containerClasses} ${className}`}>
      <label className="block text-sm font-medium text-slate-400 mb-2">
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
      </label>
      <div className="bg-slate-700 rounded p-3">
        <div className="text-white text-sm">
          {renderValue()}
        </div>
      </div>
    </div>
  );
};

export default InfoField; 