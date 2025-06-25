import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
}

/**
 * Debug component for testing logout functionality
 */
export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = '',
  showText = true 
}) => {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      await logout();
    } catch (error) {
      // Force navigation even if logout fails
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`
        flex items-center gap-2 px-4 py-2 
        bg-red-600 hover:bg-red-700 
        disabled:bg-red-800 disabled:cursor-not-allowed
        text-white font-medium rounded-lg 
        transition-colors duration-200
        ${className}
      `}
    >
      <ArrowRightOnRectangleIcon className="w-4 h-4" />
      {showText && (
        <span>
          {isLoggingOut ? 'Logout...' : 'Logout'}
        </span>
      )}
    </button>
  );
}; 