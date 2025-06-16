import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-slate-600/30';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            style={index === lines - 1 ? { ...style, width: '75%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Skeleton presets for common UI patterns
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
    <div className="space-y-4">
      <Skeleton variant="text" height={24} className="w-1/3" />
      <Skeleton variant="text" lines={3} />
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={100} height={32} />
      </div>
    </div>
  </div>
);

export const SkeletonHeader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex items-center gap-3">
      <Skeleton variant="text" height={32} className="w-1/2" />
      <Skeleton variant="rounded" width={80} height={24} />
    </div>
    <Skeleton variant="rounded" width={120} height={40} />
  </div>
);

export const SkeletonGrid: React.FC<{ 
  className?: string; 
  cols?: number; 
  rows?: number; 
}> = ({ 
  className = '', 
  cols = 3, 
  rows = 2 
}) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-6 ${className}`}>
    {Array.from({ length: cols * rows }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton variant="text" height={16} className="w-1/2" />
        <div className="bg-slate-700 rounded p-3">
          <Skeleton variant="text" height={20} />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ 
  className?: string; 
  items?: number; 
}> = ({ 
  className = '', 
  items = 3 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="border border-slate-600 rounded-lg p-4 bg-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={32} height={32} />
            <div className="space-y-1">
              <Skeleton variant="text" height={16} width={120} />
              <Skeleton variant="text" height={12} width={80} />
            </div>
          </div>
          <Skeleton variant="rounded" width={60} height={20} />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" lines={2} />
          <div className="flex gap-1">
            <Skeleton variant="rounded" width={60} height={20} />
            <Skeleton variant="rounded" width={80} height={20} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonMetadata: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
    <Skeleton variant="text" height={24} className="w-1/3 mb-4" />
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index}>
          <Skeleton variant="text" height={14} className="w-1/4 mb-1" />
          <div className="bg-slate-700 p-2 rounded">
            <Skeleton variant="text" height={16} className={index === 0 ? "w-full" : "w-3/4"} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonVersioning: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
    <div className="flex items-center gap-3 mb-6">
      <Skeleton variant="circular" width={24} height={24} />
      <Skeleton variant="text" height={24} className="w-1/3" />
      <Skeleton variant="rounded" width={80} height={24} />
    </div>
    
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={`border rounded-lg p-4 ${
          index === 0 ? 'border-green-800 bg-green-900/20' : 'border-slate-600 bg-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={32} height={32} />
              <div className="space-y-1">
                <Skeleton variant="text" height={16} width={100} />
                <Skeleton variant="text" height={12} width={80} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {index === 0 && <Skeleton variant="rounded" width={80} height={20} />}
              <Skeleton variant="circular" width={20} height={20} />
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            <Skeleton variant="rounded" width={60} height={20} />
            <Skeleton variant="rounded" width={80} height={20} />
          </div>
        </div>
      ))}
    </div>
  </div>
); 