import React from 'react';
import ResponsiveLayout from '../layout/ResponsiveLayout';

interface FormLayoutProps {
  title: string;
  children: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({ 
  title, 
  children, 
  sidebar, 
  className = "" 
}) => {
  return (
    <ResponsiveLayout title={title}>
      <div className={`max-w-6xl mx-auto h-[calc(100vh-8rem)] ${className}`}>
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 w-full h-full">
          {/* Sidebar - Mobile: Top, Desktop: Right */}
          <div className="lg:col-span-1 lg:order-2 mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-6">
              {sidebar}
            </div>
          </div>

          {/* Main Content - Mobile: After sidebar, Desktop: Left */}
          <div className="lg:col-span-2 lg:order-1 lg:overflow-y-auto lg:pr-2">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}; 