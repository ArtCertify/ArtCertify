import React from 'react';
import { CertificationBackgroundPattern } from '../ui';

interface BackgroundLayoutProps {
  children: React.ReactNode;
  className?: string;
  backgroundDensity?: 'low' | 'medium' | 'high';
  backgroundOpacity?: 'subtle' | 'visible' | 'prominent';
  fullScreen?: boolean;
}

const BackgroundLayout: React.FC<BackgroundLayoutProps> = ({
  children,
  className = '',
  backgroundDensity = 'medium',
  backgroundOpacity = 'visible',
  fullScreen = false
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Background Pattern */}
      <CertificationBackgroundPattern
        density={backgroundDensity}
        opacity={backgroundOpacity}
        fullScreen={fullScreen}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundLayout;
