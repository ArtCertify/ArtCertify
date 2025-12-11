import React from 'react';
import ResponsiveLayout from '../layout/ResponsiveLayout';

interface FormLayoutProps {
  children: React.ReactNode;
  className?: string;
  isUploadingFile?: boolean;
  onRequestExitAction?: (action: "home" | "profile" | "logout") => void;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  className = "",
  isUploadingFile,
  onRequestExitAction
}) => {
  return (
    <ResponsiveLayout isUploadingFile={isUploadingFile} onRequestExitAction={onRequestExitAction}>
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