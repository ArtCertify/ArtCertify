import React, { useState, useRef, useEffect } from 'react';

interface TruncatedTextProps {
  text: string;
  maxWidth?: string | number; // CSS width value (e.g., '200px', '20rem', 200)
  className?: string;
  tooltipClassName?: string;
  disabled?: boolean; // Disable truncation and tooltip
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxWidth = '200px',
  className = '',
  tooltipClassName = '',
  disabled = false
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Check if text is overflowing
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && !disabled) {
        const element = textRef.current;
        setIsOverflowing(element.scrollWidth > element.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text, disabled]);

  // If disabled, return simple text
  if (disabled) {
    return <span className={className}>{text}</span>;
  }

  const handleMouseEnter = () => {
    if (isOverflowing) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const maxWidthStyle = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;

  return (
    <div className="relative inline-block">
      <div
        ref={textRef}
        className={`truncate cursor-pointer ${className} ${isOverflowing ? 'hover:text-opacity-80' : ''}`}
        style={{ maxWidth: maxWidthStyle }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={isOverflowing ? text : undefined}
      >
        {text}
      </div>

      {/* Tooltip */}
      {showTooltip && isOverflowing && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm bg-slate-900 text-white rounded-lg shadow-lg border border-slate-700 whitespace-nowrap transform -translate-x-1/2 left-1/2 mt-2 pointer-events-none animate-in fade-in-0 duration-200 ${tooltipClassName}`}
        >
          {text}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 border-l border-t border-slate-700 rotate-45"></div>
        </div>
      )}
    </div>
  );
}; 