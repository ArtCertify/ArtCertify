import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
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

  const logout = useCallback(async () => {
    // Prevent multiple concurrent logout calls
    if (logoutInProgress.current) {
      console.log('[AuthContext] ⏸️ Logout già in corso, ignoro richiesta');
      return;
    }

    console.log('[AuthContext] 🚪 Inizio processo di logout');
    logoutInProgress.current = true;

    try {
      // Get current address before clearing
      const currentAddress = userAddress;
      console.log(`[AuthContext] Logout per indirizzo: ${currentAddress || 'N/A'}`);
      
      // Disconnect from Pera Wallet if connected
      if (peraWalletService.isConnected()) {
        console.log('[AuthContext] Disconnessione da Pera Wallet...');
        await peraWalletService.disconnect();
        console.log('[AuthContext] ✅ Disconnesso da Pera Wallet');
      }
      
      // Clear authentication state
      console.log('[AuthContext] Pulizia stato autenticazione...');
      setUserAddress(null);
      setIsAuthenticated(false);
      
      // Clear ALL authentication data (JWT, base64, signature, cache, cookies, sessionStorage)
      authService.clearAllAuthData(currentAddress);
      console.log('[AuthContext] ✅ Dati autenticazione cancellati');
    } catch (error) {
      console.error('[AuthContext] ❌ Errore durante logout:', error);
      // Force clear state even if there's an error
      const currentAddress = userAddress;
      setUserAddress(null);
      setIsAuthenticated(false);
      authService.clearAllAuthData(currentAddress);
      console.log('[AuthContext] ✅ Stato forzato a cleared nonostante errore');
    } finally {
      // Reset logout flag
      logoutInProgress.current = false;
      console.log('[AuthContext] 🚪 Logout completato, redirect a login page');

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
    console.log('[AuthContext] Verifica validità token durante inizializzazione...');
    const isTokenValid = authService.isTokenValid();
    if (!isTokenValid && savedAddress) {
      console.warn('[AuthContext] ❌ Token non valido durante inizializzazione, pulizia dati autenticazione');
      // Token is invalid, clear authentication data
      authService.clearAllAuthData(savedAddress);
      localStorage.removeItem('algorand_address');
      localStorage.removeItem('pera_wallet_connected');
      localStorage.removeItem('pera_wallet_account');
      initializationComplete.current = true;
      return;
    }
    if (isTokenValid && savedAddress) {
      console.log('[AuthContext] ✅ Token valido durante inizializzazione');
    }

    // Only restore session if both localStorage and Pera indicate connection
    if (savedAddress && peraConnected && peraWalletService.hasStoredConnection()) {
      // Try to reconnect to Pera Wallet
      peraWalletService.reconnectSession()
        .then((accounts) => {
          if (accounts.length > 0 && accounts[0] === savedAddress) {
            // Verify token is still valid before setting authenticated state
            console.log('[AuthContext] Verifica token dopo riconnessione Pera Wallet...');
            const tokenStillValid = authService.isTokenValid();
            if (tokenStillValid) {
              console.log('[AuthContext] ✅ Token valido, ripristino sessione autenticata');
      setUserAddress(savedAddress);
      setIsAuthenticated(true);
            } else {
              console.warn('[AuthContext] ❌ Token scaduto dopo riconnessione, pulizia dati');
              // Token expired, clear data
              authService.clearAllAuthData(savedAddress);
              localStorage.removeItem('algorand_address');
              localStorage.removeItem('pera_wallet_connected');
              localStorage.removeItem('pera_wallet_account');
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
      console.log('[AuthContext] 📢 Ricevuto evento jwtTokenInvalid da axios interceptor');
      if (!logoutInProgress.current) {
        console.log('[AuthContext] Trigger logout per token non valido');
        logout();
      } else {
        console.log('[AuthContext] ⏸️ Logout già in corso, ignoro evento');
      }
    };

    peraWalletService.on('disconnect', handlePeraDisconnect);
    window.addEventListener('jwtTokenInvalid', handleJWTInvalid);

    return () => {
      peraWalletService.off('disconnect', handlePeraDisconnect);
      window.removeEventListener('jwtTokenInvalid', handleJWTInvalid);
    };
  }, [logout]);

  // Periodic token validation check
  useEffect(() => {
    // Only check if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Check token validity every 2 minutes
    // Read exp field from JWT payload (86400 seconds = 1 day, set by backend)
    const tokenCheckInterval = setInterval(() => {
      if (!logoutInProgress.current) {
        console.log('[AuthContext] 🔄 Controllo periodico validità token (ogni 2 minuti)');
        console.log('[AuthContext] 📋 Verifica campo exp dal JWT (durata: 86400 secondi = 1 giorno)');
        
        // Check token validity by reading exp field from JWT payload
        const isValid = authService.isTokenValid();
        if (!isValid) {
          console.warn('[AuthContext] ❌ Token scaduto (campo exp nel JWT), trigger logout');
          logout();
        } else {
          console.log('[AuthContext] ✅ Token ancora valido (campo exp nel JWT)');
        }
      }
    }, 120000); // Check every 2 minutes (120000 milliseconds)

    // Also check immediately when component mounts or authentication state changes
    console.log('[AuthContext] 🔄 Controllo immediato validità token al cambio stato autenticazione');
    console.log('[AuthContext] 📋 Verifica campo exp dal JWT (durata: 86400 secondi = 1 giorno)');
    const isValid = authService.isTokenValid();
    if (!isValid && !logoutInProgress.current) {
      console.warn('[AuthContext] ❌ Token scaduto (campo exp nel JWT), trigger logout');
      logout();
    } else if (isValid) {
      console.log('[AuthContext] ✅ Token ancora valido (campo exp nel JWT)');
    }

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [isAuthenticated, logout]);

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