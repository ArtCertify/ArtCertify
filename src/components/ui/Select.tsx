import React, { forwardRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'filled';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  placeholder,
  variant = 'default',
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const baseSelectClasses = 'w-full px-3 py-2 pr-10 text-white appearance-none transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'bg-slate-700 border border-slate-600 rounded-lg hover:border-slate-500 focus:border-primary-500',
    filled: 'bg-slate-800 border-0 rounded-lg focus:bg-slate-700'
  };

  const errorClasses = error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : '';
  
  const selectClasses = `${baseSelectClasses} ${variantClasses[variant]} ${errorClasses} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-label-form text-slate-300"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
              className="bg-slate-700 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
        </div>
      </div>
      
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

Select.displayName = 'Select';

export default Select; 