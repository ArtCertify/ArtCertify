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
   */
  async getWalletInfo(address: string): Promise<WalletInfo> {
    try {
      const [accountInfo, assets, transactions] = await Promise.all([
        this.getAccountInfo(address),
        this.getAccountAssets(address),
        this.getRecentTransactions(address),
        this.getCurrentExchangeRate() // Initialize exchange rate
      ]);

      const balance = this.formatBalance(Number(accountInfo.amount || 0));

      return {
        address,
        balance,
        minBalance: accountInfo.minBalance || 0,
        totalAssetsOptedIn: accountInfo.totalAssetsOptedIn || 0,
        totalAppsOptedIn: accountInfo.totalAppsOptedIn || 0,
        totalCreatedAssets: accountInfo.totalCreatedAssets || 0,
        totalCreatedApps: accountInfo.totalCreatedApps || 0,
        status: accountInfo.status || 'online',
        assets,
        recentTransactions: transactions
      };
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      throw new Error(`Failed to fetch wallet information for address ${address}`);
    }
  }

  /**
   * Get account information from Algorand
   */
  private async getAccountInfo(address: string) {
    const indexer = algorandService.getIndexer();
    const accountInfo = await indexer.lookupAccountByID(address).do();
    
    if (!accountInfo.account) {
      throw new Error('Account not found');
    }

    return accountInfo.account;
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
            console.warn(`Failed to fetch details for asset ${asset.assetId}:`, error);
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
      console.error('Error fetching account assets:', error);
      return [];
    }
  }

  /**
   * Get recent transactions for an account
   */
  private async getRecentTransactions(address: string, limit = 10): Promise<WalletTransaction[]> {
    try {
      const indexer = algorandService.getIndexer();
      const response = await indexer
        .searchForTransactions()
        .address(address)
        .limit(limit)
        .do();

      if (!response.transactions) {
        return [];
      }

      return response.transactions.map((txn: any): WalletTransaction => {
        const payment = txn.paymentTransaction;
        const assetTransfer = txn.assetTransferTransaction;
        
        // Determine transaction type and amount
        let type = 'unknown';
        let amount = 0;
        let receiver = '';
        let sender = txn.sender;

        if (payment) {
          type = 'payment';
          amount = payment.amount || 0;
          receiver = payment.receiver || '';
        } else if (assetTransfer) {
          type = 'asset-transfer';
          amount = assetTransfer.amount || 0;
          receiver = assetTransfer.receiver || '';
        } else if (txn.applicationTransaction) {
          type = 'app-call';
        } else if (txn.assetConfigTransaction) {
          type = 'asset-config';
        }

        return {
          id: txn.id,
          type,
          amount: this.microAlgoToAlgo(amount),
          sender,
          receiver,
          timestamp: txn.roundTime || 0,
          round: txn.confirmedRound || 0,
          fee: this.microAlgoToAlgo(txn.fee || 0),
          note: txn.note ? this.decodeNote(txn.note) : undefined
        };
      });
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
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
      return Buffer.from(note, 'base64').toString('utf-8');
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