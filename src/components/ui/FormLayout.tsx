import React from 'react';
import ResponsiveLayout from '../layout/ResponsiveLayout';

interface FormLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <ResponsiveLayout>
      <div className={`max-w-7xl mx-auto ${className}`}>
        <div className="w-full">
          {/* Main Content - Full Width */}
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}; 