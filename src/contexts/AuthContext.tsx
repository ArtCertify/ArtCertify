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
  const initializationComplete = useRef(false);

  const logout = async () => {
    // Prevent multiple concurrent logout calls
    if (logoutInProgress.current) {
      return;
    }

    logoutInProgress.current = true;

    try {
      console.log('🔓 Starting logout process...');
      
      // Disconnect from Pera Wallet if connected
      if (peraWalletService.isConnected()) {
        console.log('📱 Disconnecting from Pera Wallet...');
        await peraWalletService.disconnect();
      }
      
      // Clear authentication state
      console.log('🧹 Clearing authentication state...');
      setUserAddress(null);
      setIsAuthenticated(false);
      
      // Clear ALL authentication-related localStorage items
      localStorage.removeItem('algorand_address');
      localStorage.removeItem('pera_wallet_connected');
      localStorage.removeItem('pera_wallet_account');
      
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Force clear state even if there's an error
      setUserAddress(null);
      setIsAuthenticated(false);
      localStorage.removeItem('algorand_address');
      localStorage.removeItem('pera_wallet_connected');
      localStorage.removeItem('pera_wallet_account');
    } finally {
      // Reset logout flag
      logoutInProgress.current = false;
      
      // Navigate to login page after a small delay to ensure state is cleared
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  };

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationComplete.current) {
      return;
    }

    console.log('🚀 Initializing AuthContext...');

    // Check for existing wallet connection from localStorage
    const savedAddress = localStorage.getItem('algorand_address');
    const peraConnected = localStorage.getItem('pera_wallet_connected') === 'true';
    
    console.log('💾 Saved address:', savedAddress);
    console.log('📱 Pera connected:', peraConnected);

    // Only restore session if both localStorage and Pera indicate connection
    if (savedAddress && peraConnected && peraWalletService.hasStoredConnection()) {
      console.log('🔄 Attempting to restore session...');
      
      // Try to reconnect to Pera Wallet
      peraWalletService.reconnectSession()
        .then((accounts) => {
          if (accounts.length > 0 && accounts[0] === savedAddress) {
            console.log('✅ Session restored successfully');
            setUserAddress(savedAddress);
            setIsAuthenticated(true);
          } else {
            console.log('❌ Session restoration failed - clearing data');
            // Clear inconsistent data
            localStorage.removeItem('algorand_address');
            localStorage.removeItem('pera_wallet_connected');
            localStorage.removeItem('pera_wallet_account');
          }
        })
        .catch((error) => {
          console.log('❌ Reconnection failed:', error);
          // Clear data if reconnection fails
          localStorage.removeItem('algorand_address');
          localStorage.removeItem('pera_wallet_connected');
          localStorage.removeItem('pera_wallet_account');
        })
        .finally(() => {
          initializationComplete.current = true;
        });
    } else {
      console.log('🆕 No valid session found');
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
      console.log('📱 Pera Wallet disconnected');
      // Don't call logout here to avoid circular dependency
      // Just clear the authentication state if not already logging out
      if (!logoutInProgress.current) {
        console.log('🧹 Clearing state due to Pera disconnect');
        setUserAddress(null);
        setIsAuthenticated(false);
        localStorage.removeItem('algorand_address');
        localStorage.removeItem('pera_wallet_connected');
        localStorage.removeItem('pera_wallet_account');
        
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
    console.log('🔑 Login with address:', address);
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