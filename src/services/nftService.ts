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
  private readonly RATE_LIMIT_DELAY = 200; // Increased delay for safety
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  /**
   * Sleep utility function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry utility with exponential backoff
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.MAX_RETRIES,
    delay: number = this.RETRY_DELAY
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.status >= 500)) {
        await this.sleep(delay);
        return this.withRetry(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  /**
   * Process items in chunks with rate limiting and retry logic
   * Currently unused but kept for future batch processing needs
   */
  /*
  private async processInChunks<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    chunkSize: number = this.CHUNK_SIZE
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      
      // Process chunk with rate limiting
      const chunkPromises = chunk.map(async (item, index) => {
        // Add delay between requests within chunk
        if (index > 0) {
          await this.sleep(this.RATE_LIMIT_DELAY);
        }
        
        return this.withRetry(() => processor(item));
      });

      const chunkResults = await Promise.allSettled(chunkPromises);
      
      // Extract successful results
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.warn(`Failed to process item ${chunk[index]}:`, result.reason);
        }
      });

      // Add delay between chunks
      if (i + chunkSize < items.length) {
        await this.sleep(this.RATE_LIMIT_DELAY * 2);
      }
    }

    return results;
  }
  */

  /**
   * Fetch all assets owned by an Algorand address
   */
  async getOwnedAssets(address: string): Promise<AccountAssets> {
    try {
      const indexer = algorandService.getIndexer();
      
      // Use lookupAccountAssets to get assets owned by the account
      const accountAssetsResponse = await this.withRetry(() => 
        indexer.lookupAccountAssets(address).do()
      );
      
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
   * Optimized method to fetch NFT details using indexer search API
   * This reduces API calls by using the assets search endpoint
   */
  async getOwnedNFTs(address: string): Promise<AssetInfo[]> {
    try {
      // Step 1: Get owned assets (fast call)
      const ownedAssets = await this.getOwnedAssets(address);
      
      // Filter assets that are likely NFTs (amount = 1, non-divisible)
      const nftAssets = ownedAssets.assets.filter(asset => asset.amount === 1);
      
      if (nftAssets.length === 0) {
        return [];
      }

      console.log(`Found ${nftAssets.length} potential NFTs. Fetching details using optimized approach...`);

      // Step 2: Use indexer search to get asset details more efficiently
      const indexer = algorandService.getIndexer();
      const nftDetails: AssetInfo[] = [];
      
      // Process in smaller batches to avoid overwhelming the indexer
      const SEARCH_BATCH_SIZE = 20;
      
      for (let i = 0; i < nftAssets.length; i += SEARCH_BATCH_SIZE) {
        const batch = nftAssets.slice(i, i + SEARCH_BATCH_SIZE);
        
        try {
          // For each asset in the batch, get its details using indexer
          const batchPromises = batch.map(async (asset) => {
            await this.sleep(this.RATE_LIMIT_DELAY); // Rate limiting
            
            return this.withRetry(async () => {
              const assetResponse = await indexer.lookupAssetByID(parseInt(asset.assetId)).do();
              
              if (assetResponse.asset) {
                const assetData = assetResponse.asset;
                
                // Check if it's actually an NFT (total = 1, decimals = 0)
                const total = typeof assetData.params.total === 'bigint' ? Number(assetData.params.total) : assetData.params.total;
                
                if (total === 1 && assetData.params.decimals === 0) {
                  // Transform indexer response to our AssetInfo format
                  const assetInfo: AssetInfo = {
                    index: typeof assetData.index === 'bigint' ? Number(assetData.index) : assetData.index,
                    params: {
                      creator: assetData.params.creator,
                      decimals: assetData.params.decimals,
                      defaultFrozen: assetData.params.defaultFrozen ?? false,
                      manager: assetData.params.manager,
                      metadataHash: assetData.params.metadataHash,
                      name: assetData.params.name || `Asset ${assetData.index}`,
                      nameB64: assetData.params.nameB64,
                      reserve: assetData.params.reserve,
                      total: BigInt(total),
                      unitName: assetData.params.unitName,
                      unitNameB64: assetData.params.unitNameB64,
                      url: assetData.params.url,
                      urlB64: assetData.params.urlB64,
                      clawback: assetData.params.clawback,
                      freeze: assetData.params.freeze
                    },
                    'created-at-round': assetData.createdAtRound ? 
                      (typeof assetData.createdAtRound === 'bigint' ? Number(assetData.createdAtRound) : assetData.createdAtRound) : 
                      undefined,
                    'deleted-at-round': assetData.destroyedAtRound ? 
                      (typeof assetData.destroyedAtRound === 'bigint' ? Number(assetData.destroyedAtRound) : assetData.destroyedAtRound) : 
                      undefined,
                    description: assetData.params.name || 'NFT Certificate'
                  };
                  
                  return assetInfo;
                }
              }
              return null;
            });
          });

          const batchResults = await Promise.allSettled(batchPromises);
          
          // Extract successful results
          batchResults.forEach((result) => {
            if (result.status === 'fulfilled' && result.value !== null) {
              nftDetails.push(result.value);
            }
          });

          // Delay between batches
          if (i + SEARCH_BATCH_SIZE < nftAssets.length) {
            await this.sleep(this.RATE_LIMIT_DELAY * 3);
          }
          
        } catch (error) {
          // Silently skip failed batches
        }
      }

      return nftDetails;
      
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
      const accountInfo = await this.withRetry(() => 
        indexer.lookupAccountByID(address).do()
      );
      
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