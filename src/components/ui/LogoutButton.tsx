import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
}

/**
 * Logout button component with improved debugging and user feedback
 */
export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = '',
  showText = true 
}) => {
  const { logout, userAddress } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    // Confirm logout action
    const confirmLogout = window.confirm(
      `Sei sicuro di voler disconnettere il wallet ${userAddress?.slice(0, 8)}...?`
    );
    
    if (!confirmLogout) return;
    
    setIsLoggingOut(true);
    
    try {
      await logout();
    } catch (error) {
      // Logout failed
      // Force navigation even if logout fails
      alert('Errore durante il logout. Reindirizzamento alla pagina di login...');
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
      title={`Disconnetti wallet ${userAddress?.slice(0, 8)}...`}
    >
      <ArrowRightOnRectangleIcon className="w-4 h-4" />
      {showText && (
        <span>
          {isLoggingOut ? 'Disconnessione...' : 'Logout'}
        </span>
      )}
    </button>
  );
}; 