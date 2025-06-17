import React from 'react';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dot' | 'pill';
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  icon,
  className = '',
  variant = 'default',
  size = 'md'
}) => {
  const statusStyles = {
    success: {
      bg: 'bg-green-900/50',
      border: 'border-green-500/50',
      text: 'text-green-400',
      dot: 'bg-green-400'
    },
    warning: {
      bg: 'bg-yellow-900/50',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      dot: 'bg-yellow-400'
    },
    error: {
      bg: 'bg-red-900/50',
      border: 'border-red-500/50',
      text: 'text-red-400',
      dot: 'bg-red-400'
    },
    info: {
      bg: 'bg-blue-900/50',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      dot: 'bg-blue-400'
    },
    neutral: {
      bg: 'bg-slate-700/50',
      border: 'border-slate-500/50',
      text: 'text-slate-400',
      dot: 'bg-slate-400'
    }
  };

  const sizeStyles = {
    sm: {
      text: 'text-xs',
      padding: 'px-2 py-1',
      dot: 'w-1.5 h-1.5',
      gap: 'gap-1'
    },
    md: {
      text: 'text-sm',
      padding: 'px-3 py-1.5',
      dot: 'w-2 h-2',
      gap: 'gap-2'
    },
    lg: {
      text: 'text-base',
      padding: 'px-4 py-2',
      dot: 'w-2.5 h-2.5',
      gap: 'gap-2'
    }
  };

  const currentStatus = statusStyles[status];
  const currentSize = sizeStyles[size];

  if (variant === 'dot') {
    return (
      <div className={`inline-flex items-center ${currentSize.gap} ${currentStatus.text} ${currentSize.text} ${className}`}>
        <div className={`${currentSize.dot} ${currentStatus.dot} rounded-full`}></div>
        {icon}
        {label}
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <span className={`inline-flex items-center ${currentSize.gap} ${currentSize.padding} ${currentStatus.bg} ${currentStatus.text} ${currentSize.text} font-medium rounded-full ${className}`}>
        {icon}
        {label}
      </span>
    );
  }

  // Default variant
  return (
    <span className={`inline-flex items-center ${currentSize.gap} ${currentSize.padding} ${currentStatus.bg} ${currentStatus.border} ${currentStatus.text} ${currentSize.text} font-medium rounded border ${className}`}>
      {icon}
      {label}
    </span>
  );
};

export default StatusBadge; 