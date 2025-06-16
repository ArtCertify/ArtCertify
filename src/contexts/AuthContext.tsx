import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  userAddress: string | null;
  isAuthenticated: boolean;
  login: (address: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing wallet connection from localStorage or wallet provider
    const savedAddress = localStorage.getItem('algorand_address');
    if (savedAddress) {
      setUserAddress(savedAddress);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (address: string) => {
    setUserAddress(address);
    setIsAuthenticated(true);
    localStorage.setItem('algorand_address', address);
  };

  const logout = () => {
    setUserAddress(null);
    setIsAuthenticated(false);
    localStorage.removeItem('algorand_address');
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