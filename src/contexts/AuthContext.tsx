import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import peraWalletService from '../services/peraWalletService';
import { authService } from '../services/authService';

interface AuthContextType {
  userAddress: string | null;
  isAuthenticated: boolean;
  hasValidToken: boolean;
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
  const [hasValidToken, setHasValidToken] = useState(false);
  const logoutInProgress = useRef(false);
  const initializationComplete = useRef(false);

  const logout = useCallback(async () => {
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
  }, [userAddress]);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationComplete.current) {
      return;
    }

    // Check for existing wallet connection from localStorage
    const savedAddress = localStorage.getItem('algorand_address');
    const peraConnected = localStorage.getItem('pera_wallet_connected') === 'true';

    // Check if JWT token is valid before restoring session
    const isTokenValid = authService.isTokenValid();
    if (!isTokenValid && savedAddress) {
      // Don't clear data, just mark token as invalid
      // User can still see the UI but buttons will be disabled
      setHasValidToken(false);
    }
    if (isTokenValid && savedAddress) {
      setHasValidToken(true);
    }

    // Only restore session if both localStorage and Pera indicate connection
    if (savedAddress && peraConnected && peraWalletService.hasStoredConnection()) {
      // Try to reconnect to Pera Wallet
      peraWalletService.reconnectSession()
        .then((accounts) => {
          if (accounts.length > 0 && accounts[0] === savedAddress) {
            // Verify token is still valid before setting authenticated state
            const tokenStillValid = authService.isTokenValid();
            setUserAddress(savedAddress);
            setIsAuthenticated(true);
            if (tokenStillValid) {
              setHasValidToken(true);
            } else {
              setHasValidToken(false);
            }
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

    // Listen for JWT token invalid events from axios interceptor
    const handleJWTInvalid = () => {
      if (!logoutInProgress.current) {
        setHasValidToken(false);
        // Don't logout, just mark token as invalid
        // User can still see the UI but buttons will be disabled
      }
    };

    peraWalletService.on('disconnect', handlePeraDisconnect);
    window.addEventListener('jwtTokenInvalid', handleJWTInvalid);

    return () => {
      peraWalletService.off('disconnect', handlePeraDisconnect);
      window.removeEventListener('jwtTokenInvalid', handleJWTInvalid);
    };
  }, [logout]);

  // Separate useEffect for jwtTokenUpdated listener - always active
  useEffect(() => {
    // Listen for JWT token updated events (when new token is saved)
    const handleJWTUpdated = () => {
      // Small delay to ensure token is saved in localStorage
      setTimeout(() => {
        // Always verify token validity, even if detail says it's valid
        // This ensures we have the most up-to-date state
        const isValid = authService.isTokenValid();
        setHasValidToken(isValid);
      }, 100);
    };

    window.addEventListener('jwtTokenUpdated', handleJWTUpdated);

    return () => {
      window.removeEventListener('jwtTokenUpdated', handleJWTUpdated);
    };
  }, []); // Empty dependency array - listener always active

  // Periodic token validation check
  useEffect(() => {
    // Only check if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Check token validity every 15 seconds (uniform across all pages)
    // Read exp field from JWT payload (86400 seconds = 1 day, set by backend)
    const tokenCheckInterval = setInterval(() => {
      if (!logoutInProgress.current) {
        // Check token validity by reading exp field from JWT payload
        const isValid = authService.isTokenValid();
        setHasValidToken(isValid);
      }
    }, 15000); // Check every 15 seconds (15000 milliseconds) - uniform across all pages

    // Also check immediately when component mounts or authentication state changes
    const isValid = authService.isTokenValid();
    setHasValidToken(isValid);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [isAuthenticated, logout]);

  const login = (address: string) => {
    setUserAddress(address);
    setIsAuthenticated(true);
    localStorage.setItem('algorand_address', address);
    // Check token validity after login
    const isValid = authService.isTokenValid();
    setHasValidToken(isValid);
  };

  const value = {
    userAddress,
    isAuthenticated,
    hasValidToken,
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