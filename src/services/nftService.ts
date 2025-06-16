import { algorandService } from './algorand';
import type { AssetInfo } from './algorand';

export interface OwnedAsset {
  assetId: string;
  amount: number;
  isFrozen: boolean;
  optedInAtRound: number;
  optedOutAtRound?: number;
}

export interface AccountAssets {
  address: string;
  assets: OwnedAsset[];
  totalAssets: number;
}

class NFTService {
  /**
   * Fetch all assets owned by an Algorand address
   */
  async getOwnedAssets(address: string): Promise<AccountAssets> {
    try {
      const indexer = algorandService.getIndexer();
      
      // Use lookupAccountAssets to get assets owned by the account
      const accountAssetsResponse = await indexer.lookupAccountAssets(address).do();
      
      if (!accountAssetsResponse.assets) {
        return {
          address,
          assets: [],
          totalAssets: 0
        };
      }

      const assets: OwnedAsset[] = accountAssetsResponse.assets
        .filter((asset: any) => asset && asset.assetId) // Filter out invalid assets
        .map((asset: any) => {
          // Handle BigInt and different field names correctly
          const assetId = asset.assetId;
          const amount = typeof asset.amount === 'bigint' ? Number(asset.amount) : asset.amount || 0;
          const isFrozen = asset.isFrozen || false;
          const optedInAtRound = typeof asset.optedInAtRound === 'bigint' ? Number(asset.optedInAtRound) : asset.optedInAtRound || 0;
          const optedOutAtRound = asset.optedOutAtRound ? (typeof asset.optedOutAtRound === 'bigint' ? Number(asset.optedOutAtRound) : asset.optedOutAtRound) : undefined;

          return {
            assetId: assetId.toString(),
            amount,
            isFrozen,
            optedInAtRound,
            optedOutAtRound
          };
        });

      return {
        address,
        assets,
        totalAssets: assets.length
      };
    } catch (error) {
      console.error('Error fetching owned assets:', error);
      throw new Error(`Failed to fetch assets for address ${address}`);
    }
  }

  /**
   * Fetch detailed information for owned NFTs/SBTs
   * Filters out fungible tokens and focuses on NFTs
   */
  async getOwnedNFTs(address: string): Promise<AssetInfo[]> {
    try {
      const ownedAssets = await this.getOwnedAssets(address);
      
      // Filter assets that are likely NFTs (amount = 1, non-divisible)
      const nftAssets = ownedAssets.assets.filter(asset => asset.amount === 1);
      
      if (nftAssets.length === 0) {
        return [];
      }

      // Fetch detailed information for each NFT
      const nftPromises = nftAssets.map(asset => 
        algorandService.getAssetInfo(asset.assetId)
      );

      const nftDetails = await Promise.allSettled(nftPromises);
      
      // Filter successful results and NFTs only
      const validNFTs: AssetInfo[] = [];
      
      nftDetails.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const asset = result.value;
          // Additional filtering for NFTs: total supply = 1, decimals = 0
          // Handle bigint comparison properly
          const total = typeof asset.params.total === 'bigint' ? Number(asset.params.total) : asset.params.total;
          if (total === 1 && asset.params.decimals === 0) {
            validNFTs.push(asset);
          }
        } else {
          console.warn(`Failed to fetch asset ${nftAssets[index].assetId}:`, result.reason);
        }
      });

      return validNFTs;
    } catch (error) {
      console.error('Error fetching owned NFTs:', error);
      throw new Error(`Failed to fetch NFTs for address ${address}`);
    }
  }

  /**
   * Check if an address owns a specific asset
   */
  async ownsAsset(address: string, assetId: string): Promise<boolean> {
    try {
      const ownedAssets = await this.getOwnedAssets(address);
      return ownedAssets.assets.some(asset => asset.assetId === assetId);
    } catch (error) {
      console.error('Error checking asset ownership:', error);
      return false;
    }
  }

  /**
   * Get SBT (Soul Bound Token) certificates owned by address
   * Filters for assets that look like certificates/SBTs
   */
  async getOwnedCertificates(address: string): Promise<AssetInfo[]> {
    try {
      const ownedNFTs = await this.getOwnedNFTs(address);
      
      // Filter for assets that look like certificates/SBTs
      const certificates = ownedNFTs.filter(nft => {
        const name = nft.params.name?.toLowerCase() || '';
        const unitName = nft.params.unitName?.toLowerCase() || '';
        
        // Look for certificate-like keywords
        const certificateKeywords = ['sbt', 'certificate', 'cert', 'diploma', 'badge', 'credential'];
        
        return certificateKeywords.some(keyword => 
          name.includes(keyword) || unitName.includes(keyword)
        );
      });

      return certificates;
    } catch (error) {
      console.error('Error fetching owned certificates:', error);
      throw new Error(`Failed to fetch certificates for address ${address}`);
    }
  }

  /**
   * Get account balance and basic info
   */
  async getAccountInfo(address: string) {
    try {
      const indexer = algorandService.getIndexer();
      const accountInfo = await indexer.lookupAccountByID(address).do();
      
      if (!accountInfo.account) {
        throw new Error('Account not found');
      }

      const account = accountInfo.account;

      return {
        address,
        balance: account.amount,
        minBalance: account.minBalance || 0,
        totalAssetsOptedIn: account.totalAssetsOptedIn || 0,
        totalAppsOptedIn: account.totalAppsOptedIn || 0,
        totalCreatedAssets: account.totalCreatedAssets || 0,
        totalCreatedApps: account.totalCreatedApps || 0,
        status: account.status
      };
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw new Error(`Failed to fetch account info for address ${address}`);
    }
  }
}

export const nftService = new NFTService(); 