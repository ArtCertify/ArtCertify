import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import peraWalletService from '../services/peraWalletService';

interface AuthContextType {
  userAddress: string | null;
  isAuthenticated: boolean;
  login: (address: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const logoutInProgress = useRef(false);

  const logout = async () => {
    // Prevent multiple concurrent logout calls
    if (logoutInProgress.current) {
      return;
    }

    logoutInProgress.current = true;

    try {
      // Disconnect from Pera Wallet if connected
      if (peraWalletService.isConnected()) {
        await peraWalletService.disconnect();
      }
    } catch (error) {
      // Error handled silently
    }

    // Clear authentication state
    setUserAddress(null);
    setIsAuthenticated(false);
    localStorage.removeItem('algorand_address');
    
    // Reset logout flag
    logoutInProgress.current = false;

    // Navigate to login page
    window.location.href = '/login';
  };

  useEffect(() => {
    // Check for existing wallet connection from localStorage or wallet provider
    const savedAddress = localStorage.getItem('algorand_address');
    if (savedAddress) {
      setUserAddress(savedAddress);
      setIsAuthenticated(true);
    }

    // Listen for Pera Wallet disconnect events
    const handlePeraDisconnect = () => {
      // Don't call logout here to avoid circular dependency
      // Just clear the authentication state
      if (!logoutInProgress.current) {
        setUserAddress(null);
        setIsAuthenticated(false);
        localStorage.removeItem('algorand_address');
        
        // Navigate to login page
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    };

    peraWalletService.on('disconnect', handlePeraDisconnect);

    return () => {
      peraWalletService.off('disconnect', handlePeraDisconnect);
    };
  }, []);

  const login = (address: string) => {
    setUserAddress(address);
    setIsAuthenticated(true);
    localStorage.setItem('algorand_address', address);
  };

  const value = {
    userAddress,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 