import React from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface FormHeaderProps {
  title: string;
  onBack: () => void;
  className?: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ 
  title, 
  onBack, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center gap-3 mb-6 ${className}`}>
      <button
        onClick={onBack}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
  );
}; 