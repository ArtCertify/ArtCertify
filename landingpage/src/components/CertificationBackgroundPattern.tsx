import React from 'react';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  BuildingOfficeIcon, 
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  StarIcon,
  TrophyIcon,
  LockClosedIcon,
  GlobeAltIcon,
  SparklesIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface CertificationBackgroundPatternProps {
  className?: string;
  density?: 'low' | 'medium' | 'high';
  opacity?: 'subtle' | 'visible' | 'prominent';
}

const CertificationBackgroundPattern: React.FC<CertificationBackgroundPatternProps> = ({ 
  className = '',
  density = 'medium',
  opacity = 'visible'
}) => {
  // Array of certification-related icons with their properties
  const icons = [
    { Icon: ShieldCheckIcon, size: 'w-6 h-6', delay: 'delay-0' },
    { Icon: DocumentTextIcon, size: 'w-5 h-5', delay: 'delay-75' },
    { Icon: BuildingOfficeIcon, size: 'w-7 h-7', delay: 'delay-150' },
    { Icon: CheckBadgeIcon, size: 'w-4 h-4', delay: 'delay-200' },
    { Icon: ClipboardDocumentCheckIcon, size: 'w-6 h-6', delay: 'delay-300' },
    { Icon: AcademicCapIcon, size: 'w-5 h-5', delay: 'delay-75' },
    { Icon: StarIcon, size: 'w-4 h-4', delay: 'delay-100' },
    { Icon: TrophyIcon, size: 'w-6 h-6', delay: 'delay-250' },
    { Icon: LockClosedIcon, size: 'w-5 h-5', delay: 'delay-125' },
    { Icon: GlobeAltIcon, size: 'w-6 h-6', delay: 'delay-175' },
    { Icon: SparklesIcon, size: 'w-4 h-4', delay: 'delay-50' },
    { Icon: CubeIcon, size: 'w-5 h-5', delay: 'delay-225' },
  ];

  // Configuration based on props
  const getDensityConfig = () => {
    switch (density) {
      case 'low': return { count: 30, scale: [0.6, 1.0] };
      case 'medium': return { count: 50, scale: [0.8, 1.4] };
      case 'high': return { count: 80, scale: [0.7, 1.6] };
      default: return { count: 50, scale: [0.8, 1.4] };
    }
  };

  const getOpacityConfig = () => {
    switch (opacity) {
      case 'subtle': return { base: 0.15, range: 0.1 };
      case 'visible': return { base: 0.3, range: 0.2 };
      case 'prominent': return { base: 0.5, range: 0.3 };
      default: return { base: 0.3, range: 0.2 };
    }
  };

  // Generate consistent positions for icons - same pattern across all pages
  const generateIconPositions = () => {
    // Use a fixed seed for consistent positioning across all pages
    const seed = 12345; // Fixed seed for consistency
    const positions = [];
    const densityConfig = getDensityConfig();
    const opacityConfig = getOpacityConfig();
    
    // Simple seeded random number generator
    let seedValue = seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    for (let i = 0; i < densityConfig.count; i++) {
      positions.push({
        x: seededRandom() * 100,
        y: seededRandom() * 100,
        rotation: seededRandom() * 360,
        scale: densityConfig.scale[0] + seededRandom() * (densityConfig.scale[1] - densityConfig.scale[0]),
        opacity: opacityConfig.base + seededRandom() * opacityConfig.range,
        icon: icons[Math.floor(seededRandom() * icons.length)]
      });
    }
    return positions;
  };

  const iconPositions = generateIconPositions();

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Animated background icons only */}
      <div className="absolute inset-0">
        {iconPositions.map((position, index) => {
          const { Icon, size, delay } = position.icon;
          return (
            <div
              key={index}
              className={`absolute animate-float ${delay}`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: `rotate(${position.rotation}deg) scale(${position.scale})`,
                opacity: position.opacity,
                animationDelay: `${(index * 0.1) % 3}s`,
                animationDuration: `${3 + (index % 3) * 0.5}s`
              }}
            >
              <Icon 
                className={`${size} text-white/25`}
                style={{
                  filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.15))'
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CertificationBackgroundPattern;
