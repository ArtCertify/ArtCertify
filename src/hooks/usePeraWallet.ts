import { useState, useEffect, useCallback } from 'react';
import peraWalletService from '../services/peraWalletService';

export interface UsePeraWalletReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  accountAddress: string | null;
  platform: 'mobile' | 'web' | null;
  
  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnectSession: () => Promise<void>;
  
  // Transaction signing
  signTransaction: (txGroups: any[][], signerAddress?: string) => Promise<Uint8Array[]>;
  
  // Utility
  getExplorerUrl: (address?: string) => string;
  error: string | null;
}

/**
 * React hook for Pera Wallet integration
 * Provides connection management and transaction signing for the MINTER role
 */
export const usePeraWallet = (): UsePeraWalletReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'mobile' | 'web' | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update state from wallet service
   */
  const updateState = useCallback(() => {
    const state = peraWalletService.getWalletState();
    setIsConnected(state.isConnected);
    setAccountAddress(state.connectedAccount);
    setPlatform(state.platform);
  }, []);

  /**
   * Connect to Pera Wallet
   */
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      const accounts = await peraWalletService.connect();
      
      if (accounts.length > 0) {
        updateState();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Pera Wallet';
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [updateState]);

  /**
   * Disconnect from Pera Wallet
   */
  const disconnect = useCallback(async () => {
    try {
      setError(null);
      await peraWalletService.disconnect();
      updateState();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(errorMessage);
    }
  }, [updateState]);

  /**
   * Reconnect to existing session
   */
  const reconnectSession = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      const accounts = await peraWalletService.reconnectSession();
      
      if (accounts.length > 0) {
        updateState();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reconnect session';
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [updateState]);

  /**
   * Sign transactions with Pera Wallet (MINTER function)
   */
  const signTransaction = useCallback(async (
    txGroups: any[][],
    signerAddress?: string
  ): Promise<Uint8Array[]> => {
    try {
      setError(null);
      
      if (!isConnected) {
        throw new Error('Pera Wallet not connected. Please connect your wallet first.');
      }

      const signedTxns = await peraWalletService.signTransaction(txGroups, signerAddress);
      
      return signedTxns;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign transaction';
      setError(errorMessage);
      throw err;
    }
  }, [isConnected]);

  /**
   * Get explorer URL for an address
   */
  const getExplorerUrl = useCallback((address?: string): string => {
    const targetAddress = address || accountAddress || '';
    return peraWalletService.getExplorerUrl(targetAddress);
  }, [accountAddress]);

  /**
   * Set up event listeners - NO auto-reconnect
   */
  useEffect(() => {
    // Event handlers
    const handleConnect = () => {
      updateState();
    };

    const handleDisconnect = () => {
      updateState();
    };

    const handleReconnect = () => {
      updateState();
    };

    // Subscribe to events
    peraWalletService.on('connect', handleConnect);
    peraWalletService.on('disconnect', handleDisconnect);
    peraWalletService.on('reconnect', handleReconnect);

    // Initial state update (read current state, don't auto-reconnect)
    updateState();

    // Cleanup
    return () => {
      peraWalletService.off('connect', handleConnect);
      peraWalletService.off('disconnect', handleDisconnect);
      peraWalletService.off('reconnect', handleReconnect);
    };
  }, [updateState]);

  return {
    // State
    isConnected,
    isConnecting,
    accountAddress,
    platform,
    error,
    
    // Methods
    connect,
    disconnect,
    reconnectSession,
    signTransaction,
    getExplorerUrl
  };
}; 