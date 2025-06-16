import algosdk from 'algosdk';
import { CidDecoder } from './cidDecoder';
import { config } from '../config/environment';
import type { AssetConfigTransaction } from './cidDecoder';

export interface AssetParams {
  creator: string;
  decimals: number;
  defaultFrozen: boolean;
  manager?: string;
  metadataHash?: string;
  name?: string;
  nameB64?: string;
  reserve?: string;
  total: bigint;
  unitName?: string;
  unitNameB64?: string;
  url?: string;
  urlB64?: string;
  clawback?: string;
  freeze?: string;
}

export interface NftMetadata {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: Record<string, unknown>;
}

export interface AssetInfo {
  index: number;
  params: AssetParams;
  'created-at-round'?: number;
  'deleted-at-round'?: number;
  // Enhanced fields with CID decoding
  creationTransaction?: unknown;
  configHistory?: AssetConfigTransaction[];
  versioningInfo?: unknown[];
  currentReserveInfo?: string;
  currentCidInfo?: unknown;
  nftMetadata?: NftMetadata;
  description?: string;
}

class AlgorandService {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;

  constructor() {
    // Configuration from environment
    this.algodClient = new algosdk.Algodv2(
      config.algod.token, 
      config.algod.server, 
      config.algod.port
    );
    this.indexerClient = new algosdk.Indexer(
      config.indexer.token, 
      config.indexer.server, 
      config.indexer.port
    );
  }

  // Getter methods for clients
  getAlgod(): algosdk.Algodv2 {
    return this.algodClient;
  }

  getIndexer(): algosdk.Indexer {
    return this.indexerClient;
  }

  async getAssetInfo(assetId: string): Promise<AssetInfo> {
    try {
      const assetIdNum = parseInt(assetId);
      
      // Get asset information
      const assetInfo = await this.algodClient.getAssetByID(assetIdNum).do();
      
      // Get asset creation transaction
      const creationTxn = await this.getAssetCreationTransaction(assetIdNum);
      
      // Get asset config history for versioning
      const configHistory = await this.getAssetConfigHistory(assetIdNum);
      
      // Get reserve addresses in chronological order (following Python approach)
      const reserveHistory = await this.getAssetReserveHistory(assetIdNum);
      
      // Extract versioning info with CID decoding using the new approach
      const versioningInfo = reserveHistory.length > 0 
        ? await CidDecoder.extractVersioningFromReserves(reserveHistory, configHistory)
        : await CidDecoder.extractVersioningInfo(configHistory);
      
      // Decode current reserve address using ARC-0019
      const currentReserveInfo = assetInfo.params.reserve 
        ? CidDecoder.decodeReserveAddress(assetInfo.params.reserve)
        : 'Nessuna informazione disponibile';
      
      // Get CID info for current reserve address
      const currentCidInfo = assetInfo.params.reserve 
        ? CidDecoder.decodeReserveAddressToCid(assetInfo.params.reserve)
        : null;

      // Extract NFT metadata
      const nftMetadata = await this.extractNftMetadata(assetInfo.params);

      // Extract description from asset params or URL
      const description = await this.extractDescription(assetInfo.params);

      const assetData: AssetInfo = {
        index: assetIdNum,
        params: {
          creator: assetInfo.params.creator,
          decimals: assetInfo.params.decimals,
          defaultFrozen: assetInfo.params.defaultFrozen || false,
          manager: assetInfo.params.manager,
          metadataHash: assetInfo.params.metadataHash,
          name: assetInfo.params.name || `Asset ${assetIdNum}`,
          nameB64: assetInfo.params.nameB64,
          reserve: assetInfo.params.reserve,
          total: assetInfo.params.total,
          unitName: assetInfo.params.unitName,
          unitNameB64: assetInfo.params.unitNameB64,
          url: assetInfo.params.url,
          urlB64: assetInfo.params.urlB64,
          clawback: assetInfo.params.clawback,
          freeze: assetInfo.params.freeze
        },
        'created-at-round': assetInfo['created-at-round'],
        'deleted-at-round': assetInfo['deleted-at-round'],
        creationTransaction: creationTxn,
        configHistory: configHistory,
        versioningInfo: versioningInfo,
        currentReserveInfo: currentReserveInfo,
        currentCidInfo: currentCidInfo,
        nftMetadata: nftMetadata,
        description: description
      };

      return assetData;
    } catch (error) {
      console.error('Error fetching asset info:', error);
      throw new Error(`Failed to fetch asset information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractDescription(params: AssetParams): Promise<string> {
    // Skip IPFS calls in development to avoid CORS and timeout errors
    if (import.meta.env.MODE === 'development') {
      return params.name || 'Nessuna descrizione disponibile (modalità sviluppo).';
    }

    // 1. Try to get description from reserve address (CID)
    if (params.reserve) {
      
      try {
        // Use the new ARC-0019 CID decoder
        const cidResult = CidDecoder.decodeReserveAddressToCid(params.reserve);
        
        if (cidResult.success && cidResult.gatewayUrl) {
          
          try {
            const response = await fetch(cidResult.gatewayUrl);
            if (response.ok) {
              const contentType = response.headers.get('content-type');
              
              // Try to parse as JSON first
              if (contentType && contentType.includes('application/json')) {
                const metadata = await response.json();
                if (metadata.description) {
                  return metadata.description;
                }
              }
              
              // Try as plain text
              const textContent = await response.text();
              if (textContent && textContent.length > 10 && textContent.length < 5000) {
                return textContent.trim();
              }
            }
          } catch (e) {
            // Failed to fetch from IPFS gateway
          }
        }
      } catch (e) {
        // Failed to decode reserve address
      }
    }

    // 2. Try to fetch from URL if it's a metadata URL
    if (params.url && this.isValidUrl(params.url)) {
      try {
        const response = await fetch(params.url);
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const metadata = await response.json();
            if (metadata.description) {
              return metadata.description;
            }
          }
        }
      } catch (e) {
        // Failed to fetch from URL
      }
    }

    // 3. Try to decode from name or unit name if they contain meaningful text
    if (params.name && params.name.length > 10) {
      return params.name;
    }

    // No description found
    return 'Nessuna descrizione disponibile per questo asset.';
  }

  private async extractNftMetadata(params: AssetParams): Promise<NftMetadata> {
    const metadata: NftMetadata = {};

    // Skip IPFS calls in development to avoid CORS and timeout errors
    if (import.meta.env.MODE === 'development') {
      // Return basic metadata from asset params only
      if (params.name) metadata.name = params.name;
      if (params.unitName) metadata.description = `Unit: ${params.unitName}`;
      return metadata;
    }

    // 1. Try to get metadata from reserve address (CID)
    if (params.reserve) {
      
      try {
        const cidResult = CidDecoder.decodeReserveAddressToCid(params.reserve);
        
        if (cidResult.success && cidResult.cid) {
          try {
            const gatewayUrl = `https://${cidResult.cid}.ipfs.dweb.link/`;
            const response = await fetch(gatewayUrl);
            if (response.ok) {
              const contentType = response.headers.get('content-type');
              
              if (contentType && contentType.includes('application/json')) {
                const jsonMetadata = await response.json();
                
                // Map standard NFT metadata fields
                if (jsonMetadata.name) metadata.name = jsonMetadata.name;
                if (jsonMetadata.description) metadata.description = jsonMetadata.description;
                if (jsonMetadata.image) metadata.image = jsonMetadata.image;
                if (jsonMetadata.external_url) metadata.external_url = jsonMetadata.external_url;
                if (jsonMetadata.attributes) metadata.attributes = jsonMetadata.attributes;
                if (jsonMetadata.properties) metadata.properties = jsonMetadata.properties;
                
                return metadata;
              }
            }
                      } catch (e) {
              // Failed to fetch metadata from IPFS gateway
            }
          }
        } catch (e) {
          // Failed to decode reserve address for metadata
        }
      }

      // 2. Try to get metadata from URL
      if (params.url && this.isValidUrl(params.url)) {
      try {
        const response = await fetch(params.url);
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const jsonMetadata = await response.json();
            
            // Map standard NFT metadata fields
            if (jsonMetadata.name) metadata.name = jsonMetadata.name;
            if (jsonMetadata.description) metadata.description = jsonMetadata.description;
            if (jsonMetadata.image) metadata.image = jsonMetadata.image;
            if (jsonMetadata.external_url) metadata.external_url = jsonMetadata.external_url;
            if (jsonMetadata.attributes) metadata.attributes = jsonMetadata.attributes;
            if (jsonMetadata.properties) metadata.properties = jsonMetadata.properties;
            
            return metadata;
          }
        }
      } catch (e) {
        // Failed to fetch metadata from URL
      }
    }

    // 3. Fallback to asset params
    if (params.name) metadata.name = params.name;
    if (params.unitName) metadata.description = `Unit: ${params.unitName}`;

    return metadata;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return !url.includes('template-') && !url.includes('{') && !url.includes('}');
    } catch {
      return false;
    }
  }

  private async getAssetCreationTransaction(assetId: number): Promise<unknown> {
    try {
      const response = await this.indexerClient
        .searchForTransactions()
        .assetID(assetId)
        .txType('acfg')
        .do();

      // Find the creation transaction (the one that created the asset)
      const creationTxn = response.transactions.find((txn: any) => {
        const isCreation = txn['created-asset-index'] === assetId;
        return isCreation;
      });

      if (creationTxn) {
        return creationTxn;
      }

      // If no creation transaction found, return the first one
      const firstTxn = response.transactions[0];
      return firstTxn;
    } catch (error) {
      console.error('Error fetching creation transaction:', error);
      return null;
    }
  }

  private async getAssetConfigHistory(assetId: number): Promise<AssetConfigTransaction[]> {
    try {
      const response = await this.indexerClient
        .searchForTransactions()
        .assetID(assetId)
        .txType('acfg')
        .do();

      // Sort by round number to get chronological order
      const sortedTransactions = response.transactions.sort((a: any, b: any) => a['confirmed-round'] - b['confirmed-round']);
      
      return sortedTransactions;
    } catch (error) {
      console.error('Error fetching config history:', error);
      return [];
    }
  }

  /**
   * Get all reserve addresses from asset configuration transactions in chronological order
   * This follows the same approach as the Python code:
   * reserves = map(lambda t: t['asset-config-transaction']['params']['reserve'], transactions)
   */
  async getAssetReserveHistory(assetId: number): Promise<string[]> {
    try {
      const response = await this.indexerClient
        .searchForTransactions()
        .assetID(assetId)
        .txType('acfg')
        .do();

      // Sort by round number to get chronological order (submission order)
      const sortedTransactions = response.transactions.sort((a: any, b: any) => a['confirmed-round'] - b['confirmed-round']);
      
      // Extract reserve addresses from each transaction
      // Note: API returns camelCase (assetConfigTransaction) not kebab-case (asset-config-transaction)
      const reserves = sortedTransactions
        .map((txn: any) => txn.assetConfigTransaction?.params?.reserve)
        .filter((reserve: string | undefined) => reserve !== undefined);

      // Disabled to reduce console noise during development
      // console.log('Reserve addresses in chronological order:', reserves);
      
      return reserves;
    } catch (error) {
      console.error('Error fetching reserve history:', error);
      return [];
    }
  }

  async getAssetTransactions(assetId: string): Promise<unknown[]> {
    try {
      const assetIdNum = parseInt(assetId);
      const response = await this.indexerClient
        .searchForTransactions()
        .assetID(assetIdNum)
        .do();

      return response.transactions || [];
    } catch (error) {
      console.error('Error fetching asset transactions:', error);
      return [];
    }
  }

  /**
   * Generate explorer URL for asset
   */
  getAssetExplorerUrl(assetId: string): string {
    return `https://testnet.explorer.perawallet.app/asset/${assetId}/`;
  }

  /**
   * Generate explorer URL for address
   */
  getAddressExplorerUrl(address: string): string {
    return `https://testnet.explorer.perawallet.app/address/${address}/`;
  }

  /**
   * Generate explorer URL for transaction
   */
  getTransactionExplorerUrl(txId: string): string {
    return `https://testnet.explorer.perawallet.app/tx/${txId}/`;
  }
}

export const algorandService = new AlgorandService(); 