import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  resize = 'vertical',
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const baseTextareaClasses = 'w-full px-3 py-2 text-white placeholder-slate-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'bg-slate-700 border border-slate-600 rounded-lg hover:border-slate-500 focus:border-primary-500',
    filled: 'bg-slate-800 border-0 rounded-lg focus:bg-slate-700'
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };

  const errorClasses = error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : '';
  
  const textareaClasses = `${baseTextareaClasses} ${variantClasses[variant]} ${resizeClasses[resize]} ${errorClasses} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-label-form text-slate-300"
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        className={textareaClasses}
        {...props}
      />
      
      {(error || helperText) && (
        <div className="text-body-secondary">
          {error ? (
            <span className="text-error-400">{error}</span>
          ) : (
            <span className="text-slate-400">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea; 