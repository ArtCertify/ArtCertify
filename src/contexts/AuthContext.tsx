import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import peraWalletService from '../services/peraWalletService';
import { authService } from '../services/authService';

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
  const initializationComplete = useRef(false);

  const logout = async () => {
    // Prevent multiple concurrent logout calls
    if (logoutInProgress.current) {
      return;
    }

    logoutInProgress.current = true;

    try {
      // Get current address before clearing
      const currentAddress = userAddress;
      
      // Disconnect from Pera Wallet if connected
      if (peraWalletService.isConnected()) {
        await peraWalletService.disconnect();
      }
      
      // Clear authentication state
      setUserAddress(null);
      setIsAuthenticated(false);
      
      // Clear ALL authentication data (JWT, base64, signature, cache, cookies, sessionStorage)
      authService.clearAllAuthData(currentAddress);
    } catch (error) {
      // Force clear state even if there's an error
      const currentAddress = userAddress;
      setUserAddress(null);
      setIsAuthenticated(false);
      authService.clearAllAuthData(currentAddress);
    } finally {
      // Reset logout flag
      logoutInProgress.current = false;

      // Navigate to login page using React Router
      setTimeout(() => {
        // Force a page reload to ensure clean state
        window.location.href = '/';
      }, 100);
    }
  };

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationComplete.current) {
      return;
    }

    // Check for existing wallet connection from localStorage
    const savedAddress = localStorage.getItem('algorand_address');
    const peraConnected = localStorage.getItem('pera_wallet_connected') === 'true';

    // Only restore session if both localStorage and Pera indicate connection
    if (savedAddress && peraConnected && peraWalletService.hasStoredConnection()) {
      // Try to reconnect to Pera Wallet
      peraWalletService.reconnectSession()
        .then((accounts) => {
          if (accounts.length > 0 && accounts[0] === savedAddress) {
      setUserAddress(savedAddress);
      setIsAuthenticated(true);
          } else {
            // Clear inconsistent data
            localStorage.removeItem('algorand_address');
            localStorage.removeItem('pera_wallet_connected');
            localStorage.removeItem('pera_wallet_account');
          }
        })
        .catch(() => {
          // Clear data if reconnection fails
          localStorage.removeItem('algorand_address');
          localStorage.removeItem('pera_wallet_connected');
          localStorage.removeItem('pera_wallet_account');
        })
        .finally(() => {
          initializationComplete.current = true;
        });
    } else {
      // Clear any inconsistent data
      if (savedAddress && !peraConnected) {
        localStorage.removeItem('algorand_address');
      }
      if (!savedAddress && peraConnected) {
        localStorage.removeItem('pera_wallet_connected');
        localStorage.removeItem('pera_wallet_account');
      }
      initializationComplete.current = true;
    }

    // Listen for Pera Wallet disconnect events
    const handlePeraDisconnect = () => {
      // Don't call logout here to avoid circular dependency
      // Just clear the authentication state if not already logging out
      if (!logoutInProgress.current) {
        const currentAddress = userAddress;
        setUserAddress(null);
        setIsAuthenticated(false);
        
        // Clear ALL authentication data (JWT, base64, signature, cache, cookies, sessionStorage)
        authService.clearAllAuthData(currentAddress);
        
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