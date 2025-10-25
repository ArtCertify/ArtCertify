import { algorandService } from './algorand';
import { nftService } from './nftService';

export interface WalletBalance {
  algo: number;
  microAlgo: number;
  eurValue?: number;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  sender: string;
  receiver: string;
  timestamp: number;
  round: number;
  fee: number;
  note?: string;
}

export interface WalletAsset {
  assetId: string;
  name?: string;
  unitName?: string;
  amount: number;
  decimals: number;
  url?: string;
  total?: number;
}

export interface WalletInfo {
  address: string;
  balance: WalletBalance;
  minBalance: number;
  totalAssetsOptedIn: number;
  totalAppsOptedIn: number;
  totalCreatedAssets: number;
  totalCreatedApps: number;
  status: string;
  assets: WalletAsset[];
  recentTransactions: WalletTransaction[];
  isEmptyAccount: boolean;
  participationInfo?: {
    isOnline: boolean;
    voteParticipationKey?: string;
    selectionParticipationKey?: string;
  };
}

class WalletService {
  private algoToEurRate = 0; // Will be fetched from API

  /**
   * Get comprehensive wallet information
   * Gestisce account vuoti/nuovi come caso normale
   */
  async getWalletInfo(address: string): Promise<WalletInfo> {
    try {
      // Tenta di ottenere informazioni account
      const accountResult = await this.getAccountInfoSafe(address);
      
      // Se l'account non esiste, restituisci dati vuoti
      if (accountResult.isEmpty) {
        return this.createEmptyWalletInfo(address);
      }

      const [assets, transactions] = await Promise.all([
        this.getAccountAssets(address),
        this.getRecentTransactions(address),
        this.getCurrentExchangeRate() // Initialize exchange rate
      ]);

      const balance = this.formatBalance(Number(accountResult.account.amount || 0));

      return {
        address,
        balance,
        minBalance: accountResult.account.minBalance || 0,
        totalAssetsOptedIn: accountResult.account.totalAssetsOptedIn || 0,
        totalAppsOptedIn: accountResult.account.totalAppsOptedIn || 0,
        totalCreatedAssets: accountResult.account.totalCreatedAssets || 0,
        totalCreatedApps: accountResult.account.totalCreatedApps || 0,
        status: accountResult.account.status || 'online',
        assets,
        recentTransactions: transactions,
        isEmptyAccount: false
      };
    } catch (error) {
      console.error('❌ Error fetching wallet info:', error);
      throw new Error(`Failed to fetch wallet information for address ${address}`);
    }
  }

  /**
   * Ottieni informazioni account in modo sicuro (gestisce 404)
   */
  private async getAccountInfoSafe(address: string): Promise<{ 
    account: any; 
    isEmpty: boolean 
  }> {
    try {
      const indexer = algorandService.getIndexer();
      const accountInfo = await indexer.lookupAccountByID(address).do();
      
      if (!accountInfo.account) {
        return { account: null, isEmpty: true };
      }

      return { account: accountInfo.account, isEmpty: false };
    } catch (error: any) {
      // Gestisci 404 come account vuoto (caso normale)
      if (error?.status === 404 || 
          error?.message?.includes('no accounts found') ||
          error?.message?.includes('404')) {
        return { account: null, isEmpty: true };
      }
      
      // Altri errori sono problemi reali
      throw error;
    }
  }

  /**
   * Crea dati wallet vuoti per account nuovi
   */
  private createEmptyWalletInfo(address: string): WalletInfo {
    return {
      address,
      balance: {
        algo: 0,
        microAlgo: 0,
        eurValue: 0
      },
      minBalance: 0,
      totalAssetsOptedIn: 0,
      totalAppsOptedIn: 0,
      totalCreatedAssets: 0,
      totalCreatedApps: 0,
      status: 'offline',
      assets: [],
      recentTransactions: [],
      isEmptyAccount: true
    };
  }

  /**
   * Get account information from Algorand
   * @deprecated Use getAccountInfoSafe instead
   */
  private async getAccountInfo(address: string) {
    const result = await this.getAccountInfoSafe(address);
    if (result.isEmpty) {
      throw new Error('Account not found');
    }
    return result.account;
  }

  /**
   * Get account assets (both ASAs and NFTs)
   */
  private async getAccountAssets(address: string): Promise<WalletAsset[]> {
    try {
      const ownedAssets = await nftService.getOwnedAssets(address);
      
      if (ownedAssets.assets.length === 0) {
        return [];
      }

      const assetDetails = await Promise.allSettled(
        ownedAssets.assets.map(async (asset) => {
          try {
            const assetInfo = await algorandService.getAssetInfo(asset.assetId);
            return {
              assetId: asset.assetId,
              name: assetInfo.params.name,
              unitName: assetInfo.params.unitName,
              amount: asset.amount,
              decimals: assetInfo.params.decimals,
              url: assetInfo.params.url,
              total: typeof assetInfo.params.total === 'bigint' 
                ? Number(assetInfo.params.total) 
                : assetInfo.params.total
            } as WalletAsset;
          } catch (error) {
            console.warn(`⚠️ Failed to fetch details for asset ${asset.assetId}:`, error);
            return {
              assetId: asset.assetId,
              amount: asset.amount,
              decimals: 0
            } as WalletAsset;
          }
        })
      );

      return assetDetails
        .filter((result): result is PromiseFulfilledResult<WalletAsset> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
    } catch (error) {
      console.warn(`⚠️ Error fetching account assets for ${address}:`, error);
      return [];
    }
  }

  /**
   * Get all transactions for an account
   */
  private async getRecentTransactions(address: string, limit = 1000): Promise<WalletTransaction[]> {
    try {
      const indexer = algorandService.getIndexer();
      
      // Get ALL transaction types in a single query - more efficient
      const response = await indexer
        .searchForTransactions()
        .address(address)
        .limit(limit)
        // Remove .txType() to get ALL transaction types
        .do();

      if (!response.transactions || response.transactions.length === 0) {
        return [];
      }

      // Sort by round time or confirmed round (most recent first)
      const allTransactions = response.transactions.sort((a: any, b: any) => {
        const timeA = a['round-time'] || a.roundTime || a['confirmed-round'] || a.confirmedRound || 0;
        const timeB = b['round-time'] || b.roundTime || b['confirmed-round'] || b.confirmedRound || 0;
        return timeB - timeA;
      });

      return allTransactions.map((txn: any): WalletTransaction => {
        const payment = txn['payment-transaction'] || txn.paymentTransaction;
        const assetTransfer = txn['asset-transfer-transaction'] || txn.assetTransferTransaction;
        const assetConfig = txn['asset-config-transaction'] || txn.assetConfigTransaction;
        const appCall = txn['application-transaction'] || txn.applicationTransaction;
        
        // Determine transaction type and amount
        let type = 'unknown';
        let amount = 0;
        let receiver = '';
        let sender = txn.sender || '';

        if (payment) {
          type = 'payment';
          amount = payment.amount || 0;
          receiver = payment.receiver || '';
        } else if (assetTransfer) {
          type = 'asset-transfer';
          amount = assetTransfer.amount || 0;
          receiver = assetTransfer.receiver || '';
        } else if (appCall) {
          type = 'app-call';
          receiver = appCall['application-id']?.toString() || '';
        } else if (assetConfig) {
          type = 'asset-config';
          receiver = assetConfig['asset-id']?.toString() || '';
        }

        return {
          id: txn.id || '',
          type,
          amount: this.microAlgoToAlgo(amount),
          sender,
          receiver,
          timestamp: txn['round-time'] || txn.roundTime || 0,
          round: txn['confirmed-round'] || txn.confirmedRound || 0,
          fee: this.microAlgoToAlgo(txn.fee || 0),
          note: txn.note ? this.decodeNote(txn.note) : undefined
        };
      });
    } catch (error: any) {
      // 404 per le transazioni è normale per account nuovi
      if (error?.status === 404 || error?.message?.includes('404')) {
        return [];
      }
      
      console.warn(`⚠️ Error fetching transactions for ${address}:`, error);
      return [];
    }
  }

  /**
   * Format balance with EUR conversion
   */
  private formatBalance(microAlgo: number): WalletBalance {
    const algo = this.microAlgoToAlgo(microAlgo);
    return {
      algo,
      microAlgo,
      eurValue: algo * this.algoToEurRate
    };
  }

  /**
   * Convert microAlgo to Algo
   */
  private microAlgoToAlgo(microAlgo: number): number {
    return microAlgo / 1_000_000;
  }

  /**
   * Decode transaction note from base64
   */
  private decodeNote(note: string): string {
    try {
      return atob(note);
    } catch {
      return note;
    }
  }

  /**
   * Get current ALGO to EUR exchange rate from CoinGecko API
   */
  async getCurrentExchangeRate(): Promise<number> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=eur');
      const data = await response.json();
      this.algoToEurRate = data.algorand?.eur || 0;
      return this.algoToEurRate;
    } catch (error) {
      console.warn('Failed to fetch ALGO/EUR rate:', error);
      return 0;
    }
  }

  /**
   * Format currency values
   */
  formatAlgo(amount: number, decimals = 2): string {
    return new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  }

  formatEur(amount: number, decimals = 2): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  }

  /**
   * Check if an address is valid
   */
  isValidAddress(address: string): boolean {
    try {
      // Basic Algorand address validation
      return address.length === 58 && /^[A-Z2-7]+$/.test(address);
    } catch {
      return false;
    }
  }

  /**
   * Get wallet status information
   */
  async getWalletStatus(address: string): Promise<{
    isOnline: boolean;
    lastSeen?: Date;
    participatingInConsensus: boolean;
  }> {
    try {
      const accountInfo = await this.getAccountInfo(address);
      
      return {
        isOnline: accountInfo.status === 'Online',
        participatingInConsensus: !!accountInfo.participation,
        lastSeen: accountInfo.lastProposed ? new Date(accountInfo.lastProposed * 1000) : undefined
      };
    } catch (error) {
      console.error('Error fetching wallet status:', error);
      return {
        isOnline: false,
        participatingInConsensus: false
      };
    }
  }
}

export const walletService = new WalletService(); 