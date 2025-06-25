import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';
import { getAddressExplorerUrl, config } from '../config/environment';

// Types from the documentation
export interface SignerTransaction {
  txn: algosdk.Transaction;
  signers?: string[];
}

/**
 * Service for managing Pera Wallet connection and signing
 * Based on official Pera Connect documentation: https://github.com/perawallet/connect
 */
class PeraWalletService {
  private peraWallet: PeraWalletConnect;
  private connectedAccount: string | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    // Initialize Pera Wallet Connect with TestNet configuration
    this.peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: false,
      chainId: config.network.chainId as any, // Usa chain ID dalla configurazione
      compactMode: false
    });

    // Set up disconnect event listener
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for wallet connection/disconnection
   */
  private setupEventListeners(): void {
    this.peraWallet.connector?.on('disconnect', () => {
      this.handleDisconnect();
    });
  }

  /**
   * Connect to Pera Wallet - Shows QR code modal for mobile or desktop connection
   * Returns array of connected account addresses
   */
  async connect(): Promise<string[]> {
    try {
      const accounts = await this.peraWallet.connect();
      
      if (accounts.length > 0) {
        this.connectedAccount = accounts[0];
        this.setupEventListeners();
        this.emitEvent('connect', accounts[0]);
        
        // Store connection for session persistence
        localStorage.setItem('pera_wallet_connected', 'true');
        localStorage.setItem('pera_wallet_account', accounts[0]);
      }
      
      return accounts;
    } catch (error: any) {
      // Don't throw error if user closed modal (normal behavior)
      if (error?.data?.type === 'CONNECT_MODAL_CLOSED') {
        return [];
      }
      
      throw new Error('Failed to connect to Pera Wallet');
    }
  }

  /**
   * Reconnect to existing session on app load
   * Essential for maintaining user sessions across page refreshes
   */
  async reconnectSession(): Promise<string[]> {
    try {
      const accounts = await this.peraWallet.reconnectSession();
      
      if (accounts.length > 0) {
        this.connectedAccount = accounts[0];
        this.setupEventListeners();
        this.emitEvent('reconnect', accounts[0]);
      }
      
      return accounts;
    } catch (error) {
      this.clearStoredConnection();
      return [];
    }
  }

  /**
   * Disconnect from Pera Wallet
   */
  async disconnect(): Promise<void> {
    try {
      // Only disconnect if actually connected
      if (this.peraWallet.isConnected) {
        await this.peraWallet.disconnect();
      }
      
      this.handleDisconnect();
    } catch (error) {
      // Force disconnect locally even if remote disconnect fails
      this.handleDisconnect();
    }
  }

  /**
   * Handle disconnect event
   */
  private handleDisconnect(): void {
    this.connectedAccount = null;
    this.clearStoredConnection();
    this.emitEvent('disconnect', null);
  }

  /**
   * Clear stored connection data
   */
  private clearStoredConnection(): void {
    localStorage.removeItem('pera_wallet_connected');
    localStorage.removeItem('pera_wallet_account');
    localStorage.removeItem('algorand_address'); // Clear auth context too
  }

  /**
   * Sign transactions with Pera Wallet (MINTER functionality)
   * This is the core signing capability for the MINTER role
   */
  async signTransaction(
    txGroups: SignerTransaction[][],
    signerAddress?: string
  ): Promise<Uint8Array[]> {
    try {
      if (!this.isConnected()) {
        throw new Error('Pera Wallet not connected. Please connect your wallet first.');
      }
      
      const signedTxns = await this.peraWallet.signTransaction(
        txGroups,
        signerAddress || this.connectedAccount || undefined
      );

      return signedTxns;
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sign arbitrary data with Pera Wallet
   */
  async signData(
    data: Array<{ data: Uint8Array; message: string }>,
    signer: string
  ): Promise<Uint8Array[]> {
    try {
      if (!this.isConnected()) {
        throw new Error('Pera Wallet not connected');
      }

      const signedData = await this.peraWallet.signData(data, signer);
      return signedData;
    } catch (error) {
      throw new Error(`Failed to sign data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get wallet connection state
   */
  getWalletState() {
    return {
      isConnected: this.isConnected(),
      connectedAccount: this.connectedAccount,
      platform: this.peraWallet.platform
    };
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.peraWallet.isConnected && !!this.connectedAccount;
  }

  /**
   * Get connected account address (MINTER address)
   */
  getConnectedAccount(): string | null {
    return this.connectedAccount;
  }

  /**
   * Check if running in Pera Discover Browser
   */
  isPeraDiscoverBrowser(): boolean {
    return this.peraWallet.isPeraDiscoverBrowser;
  }

  /**
   * Event subscription system for wallet state changes
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get Algorand Explorer URL for the current network
   */
  getExplorerUrl(address: string): string {
    return getAddressExplorerUrl(address);
  }

  /**
   * Check if there's a stored connection from previous session
   */
  hasStoredConnection(): boolean {
    return localStorage.getItem('pera_wallet_connected') === 'true';
  }

  /**
   * Get stored account from previous session
   */
  getStoredAccount(): string | null {
    return localStorage.getItem('pera_wallet_account');
  }
}

// Export singleton instance
export const peraWalletService = new PeraWalletService();
export default peraWalletService;

/**
 * Get the explorer URL for a wallet address
 */
export const getWalletExplorerUrl = (address: string): string => {
  return getAddressExplorerUrl(address);
}; 