import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltipHandler = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setShowTooltip(true), 10);
    }, delay);
  };

  const hideTooltipHandler = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
    setTimeout(() => setIsVisible(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionClasses = () => {
    // Determine width based on content length
    const getWidthClass = () => {
      if (content.length <= 30) return 'max-w-xs'; // ~20rem
      if (content.length <= 60) return 'max-w-sm'; // ~24rem
      if (content.length <= 100) return 'max-w-md'; // ~28rem
      if (content.length <= 150) return 'max-w-lg'; // ~32rem
      return 'max-w-xl'; // ~36rem
    };

    const baseClasses = `absolute z-50 px-3 py-2 text-xs font-medium text-white bg-slate-900 rounded-md shadow-lg border border-slate-700 ${getWidthClass()} whitespace-normal`;
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowClasses = () => {
    const baseArrow = 'absolute w-2 h-2 bg-slate-900 border border-slate-700 transform rotate-45';
    
    switch (position) {
      case 'top':
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0`;
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-0 border-r-0`;
      case 'left':
        return `${baseArrow} left-full top-1/2 -translate-y-1/2 -ml-1 border-l-0 border-b-0`;
      case 'right':
        return `${baseArrow} right-full top-1/2 -translate-y-1/2 -mr-1 border-r-0 border-t-0`;
      default:
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0`;
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltipHandler}
      onMouseLeave={hideTooltipHandler}
      onFocus={showTooltipHandler}
      onBlur={hideTooltipHandler}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`${getPositionClasses()} transition-opacity duration-150 ${
            showTooltip ? 'opacity-100' : 'opacity-0'
          }`}
          role="tooltip"
        >
          {content}
          <div className={getArrowClasses()} />
        </div>
      )}
    </div>
  );
};

export default Tooltip; 