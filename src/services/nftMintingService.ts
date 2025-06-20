import * as algosdk from 'algosdk';
import IPFSService from './ipfsService';
import { config } from '../config/environment';
import { CidDecoder } from './cidDecoder';

// ARC-3 + ARC-19 hybrid approach - PROPER ARC-19 TEMPLATE URL

export interface MintingParams {
  mnemonic: string;
  assetName: string;
  unitName: string;
  description?: string;
  metadataHash?: string;
  reserveAddress?: string;
  total?: number;
  decimals?: number;
  defaultFrozen?: boolean;
  url?: string;
}

export interface MintingResult {
  assetId: number;
  txId: string;
  confirmedRound: number;
  assetAddress: string;
  metadataUrl?: string;
  ipfsHashes?: {
    metadata: string;
    files: Array<{ name: string; hash: string }>;
  };
  reserveAddress: string;
  metadataCid: string;
}

export interface CertificationMintParams {
  mnemonic: string;
  certificationData: {
    asset_type: string;
    unique_id: string;
    title: string;
    author: string;
    creation_date: string;
    organization: {
      name: string;
      code: string;
      type: string;
      city: string;
    };
    technical_specs?: Record<string, string>;
  };
  files: File[];
}

export interface FormData {
  artifactType: string;
  uniqueId: string;
  title: string;
  author: string;
  creationDate: string;
  assetName: string;
  unitName: string;
  [key: string]: string | File[];
}

/**
 * NFT Minting Service - Following EXACT Python mint_sbt.py pattern with ARC-19 Template URL
 * Key insight: Use ARC-19 template URL for true compliance while maintaining ARC-3 visibility
 */
class NFTMintingService {
  private algodClient: algosdk.Algodv2;
  private ipfsService: IPFSService;

  constructor() {
    this.algodClient = new algosdk.Algodv2(
      config.algod.token,
      config.algod.server,
      config.algod.port
    );
    this.ipfsService = new IPFSService();
  }

  /**
   * Convert CID to Algorand address - Following Python: from_cid_to_address
   */
  private fromCidToAddress(cidStr: string): string {
    try {
      const address = CidDecoder.fromCidToAddress(cidStr);
      return address;
    } catch (error) {
      console.error('Error converting CID to address:', error);
      throw new Error(`Failed to convert CID to address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get account from mnemonic - Following Python: algorand.account.from_mnemonic
   */
  private getAccountFromMnemonic(mnemonic: string): algosdk.Account {
    try {
      return algosdk.mnemonicToSecretKey(mnemonic);
    } catch (error) {
      console.error('Error creating account from mnemonic:', error);
      throw new Error('Invalid mnemonic phrase');
    }
  }

  /**
   * Get suggested transaction parameters
   */
  private async getSuggestedParams(): Promise<algosdk.SuggestedParams> {
    try {
      return await this.algodClient.getTransactionParams().do();
    } catch (error) {
      console.error('Error getting suggested parameters:', error);
      throw new Error('Failed to get transaction parameters');
    }
  }

  /**
   * Wait for transaction confirmation
   */
  private async waitForConfirmation(txId: string): Promise<any> {
    try {
      const response = await algosdk.waitForConfirmation(this.algodClient, txId, 4);
      return response;
    } catch (error) {
      console.error('Error waiting for confirmation:', error);
      throw new Error('Transaction failed to confirm');
    }
  }

  /**
   * Complete SBT Minting Process - ARC-3 + ARC-19 compliance
   * 
   * ARC-3 + ARC-19 workflow (following Python reference exactly):
   * 1. Upload to IPFS -> get CID
   * 2. Convert CID to reserve address: from_cid_to_address(CID)
   * 3. Create asset WITH ARC-19 template URL + reserve address
   */
  async mintCertificationSBT(params: CertificationMintParams & { 
    assetName: string; 
    unitName: string; 
    formData: FormData 
  }): Promise<MintingResult> {
    try {
      // Step 1: Upload to IPFS
      const ipfsResult = await this.ipfsService.uploadCertificationAssets(
        params.files,
        params.certificationData,
        params.formData
      );

      // Step 2: Convert CID to reserve address
      const reserveAddress = this.fromCidToAddress(ipfsResult.metadataHash);

      // Step 3: Create ARC-3 + ARC-19 compliant SBT
      const createResult = await this.createARC19SBTAsset({
        mnemonic: params.mnemonic,
        assetName: params.assetName,
        unitName: params.unitName,
        reserveAddress: reserveAddress,
        metadataCid: ipfsResult.metadataHash,
        metadataUrl: ipfsResult.metadataUrl // For debugging/reference
      });

      const account = this.getAccountFromMnemonic(params.mnemonic);

      return {
        assetId: createResult.assetId,
        txId: createResult.txId,
        confirmedRound: createResult.confirmedRound,
        assetAddress: account.addr.toString(),
        metadataUrl: ipfsResult.metadataUrl,
        reserveAddress: reserveAddress,
        metadataCid: ipfsResult.metadataHash,
        ipfsHashes: {
          metadata: ipfsResult.metadataHash,
          files: ipfsResult.fileHashes.map(f => ({ name: f.name, hash: f.hash }))
        }
      };

    } catch (error) {
      console.error('❌ Error in SBT minting process:', error);
      throw new Error(`Failed to mint certification SBT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create ARC-3 + ARC-19 compliant SBT Asset
   * 
   * ARC-3 compliance: NFT metadata standard (without @arc3 naming requirement)
   * ARC-19 compliance: Template URL with reserve address resolution
   * 
   * Following Python reference: ARC19_URL = "template-ipfs://{ipfscid:1:raw:reserve:sha2-256}"
   */
  private async createARC19SBTAsset(params: {
    mnemonic: string;
    assetName: string;
    unitName: string;
    reserveAddress: string;
    metadataCid: string;
    metadataUrl?: string; // For debugging/reference
    managerAddress?: string;
  }): Promise<{ assetId: number; txId: string; confirmedRound: number }> {
    try {
      // ARC-19 Template URL - Using format exactly like working asset 740976269
      const arc19TemplateUrl = "template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}";
      
      const account = this.getAccountFromMnemonic(params.mnemonic);
      const suggestedParams = await this.getSuggestedParams();

      // ARC-3 + ARC-19 implementation
      const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender: account.addr,
        total: 1,                                    // NFT = 1 total supply
        decimals: 0,                                 // NFTs have 0 decimals
        assetName: params.assetName,                // Use asset name as provided
        unitName: params.unitName,
        assetURL: arc19TemplateUrl,                 // ARC-19: Template URL for immutable resolution
        defaultFrozen: true,                        // SBT requirement
        manager: params.managerAddress || account.addr,
        reserve: params.reserveAddress,             // ARC-19: Reserve address for CID resolution
        
        // For SBT: freeze and clawback must be undefined (not set)
        freeze: undefined,
        clawback: undefined,
        
        suggestedParams,
      });

      // Sign and submit
      const signedTxn = assetCreateTxn.signTxn(account.sk);
      const response = await this.algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;

      // Wait for confirmation
      const confirmedTxn = await this.waitForConfirmation(txId);
      
      // Extract asset ID
      let assetId = confirmedTxn['asset-index'] || 
                    confirmedTxn['created-asset-index'] || 
                    confirmedTxn.assetIndex || 
                    confirmedTxn.createdAssetIndex;

      if (!assetId && confirmedTxn.txn?.txn) {
        assetId = confirmedTxn.txn.txn['created-asset-index'] || 
                  confirmedTxn.txn.txn['asset-index'];
      }

      if (!assetId) {
        console.error('❌ Could not extract Asset ID from transaction');
        console.error('Full transaction:', JSON.stringify(confirmedTxn, null, 2));
        throw new Error('Failed to extract Asset ID from confirmed transaction');
      }

      // Verify compliance
      const assetInfo = await this.algodClient.getAssetByID(assetId).do();
      
      // Verify ARC-19 compliance
      if (assetInfo.params.url !== arc19TemplateUrl) {
        throw new Error(`ARC-19 template URL not set correctly during asset creation`);
      }

      // Verify reserve address
      if (assetInfo.params.reserve !== params.reserveAddress) {
        throw new Error(`Reserve address not set correctly during asset creation`);
      }

      return {
        assetId,
        txId,
        confirmedRound: confirmedTxn['confirmed-round'] || 0
      };

    } catch (error) {
      console.error('Error creating ARC-3 + ARC-19 SBT asset:', error);
      throw new Error(`Failed to create SBT asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get asset information
   */
  async getAssetInfo(assetId: number): Promise<any> {
    try {
      const assetInfo = await this.algodClient.getAssetByID(assetId).do();
      
             // Try to decode reserve address to CID if available
       let metadataCid = null;
       if (assetInfo.params.reserve) {
         try {
           // Use the test conversion method to get the CID
           const testResult = CidDecoder.testConversion(assetInfo.params.reserve);
           if (testResult.success) {
             metadataCid = testResult.generatedCid;
           }
         } catch (error) {
           console.warn('Could not decode reserve address to CID:', error);
         }
       }

      return {
        ...assetInfo,
        decoded: {
          metadataCid,
          metadataUrl: metadataCid ? `ipfs://${metadataCid}` : null,
          gatewayUrl: metadataCid ? this.ipfsService.getCustomGatewayUrl(metadataCid) : null
        }
      };
    } catch (error) {
      console.error('Error getting asset info:', error);
      throw new Error(`Failed to get asset info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test service connectivity
   */
     async testService(): Promise<{ ipfs: boolean; algorand: boolean }> {
     try {
       const ipfsTest = await this.ipfsService.testConnection();
       
       let algorandTest = false;
       try {
         await this.algodClient.status().do();
         algorandTest = true;
       } catch (error) {
         console.error('Algorand connection test failed:', error);
       }
       
       return {
         ipfs: ipfsTest,
         algorand: algorandTest
       };
     } catch (error) {
       console.error('Error testing service:', error);
       return {
         ipfs: false,
         algorand: false
       };
     }
   }

  /**
   * Update Asset Reserve Address - Following Python pattern
   * 
   * Python equivalent:
   * asset_change_metadata = algokit_utils.AssetConfigParams(
   *     asset_id=SBT_AC_ID,
   *     sender=minter.address,
   *     signer=minter_sig,
   *     reserve=from_cid_to_address(CID_AC_V3),
   *     manager=minter.address
   * )
   */
  async updateAssetReserve(params: {
    assetId: number;
    newReserveAddress: string;
    managerMnemonic: string;
    metadataUrl?: string;
  }): Promise<{ txId: string; confirmedRound: number }> {
    try {
      const managerAccount = this.getAccountFromMnemonic(params.managerMnemonic);
      const suggestedParams = await this.getSuggestedParams();

      // Get current asset info to preserve existing parameters
      const currentAssetInfo = await this.algodClient.getAssetByID(params.assetId).do();

      // Following Python pattern - only include defined parameters
      const configParams = {
        sender: managerAccount.addr,
        assetIndex: params.assetId,
        manager: currentAssetInfo.params.manager,     // Preserve current manager
        reserve: params.newReserveAddress,           // Update reserve address
        suggestedParams,
        strictEmptyAddressChecking: false,
      };

      // Only include freeze if it was originally set
      if (currentAssetInfo.params.freeze && currentAssetInfo.params.freeze !== '') {
        (configParams as any).freeze = currentAssetInfo.params.freeze;
      }

      // Only include clawback if it was originally set  
      if (currentAssetInfo.params.clawback && currentAssetInfo.params.clawback !== '') {
        (configParams as any).clawback = currentAssetInfo.params.clawback;
      }

      // Update URL if provided (for ARC-3 compliance)
      if (params.metadataUrl) {
        (configParams as any).assetURL = params.metadataUrl;
      }

      // Create asset configuration transaction
      const assetConfigTxn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject(configParams);

      // Sign and submit
      const signedTxn = assetConfigTxn.signTxn(managerAccount.sk);
      const response = await this.algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;

      // Wait for confirmation
      const confirmedTxn = await this.waitForConfirmation(txId);

      // Verify reserve address update
      const updatedAssetInfo = await this.algodClient.getAssetByID(params.assetId).do();
      
      if (updatedAssetInfo.params.reserve !== params.newReserveAddress) {
        throw new Error(`Reserve address update failed - expected: ${params.newReserveAddress}, got: ${updatedAssetInfo.params.reserve}`);
      }

      return {
        txId,
        confirmedRound: confirmedTxn['confirmed-round'] || 0
      };

    } catch (error) {
      console.error('❌ Error updating asset reserve:', error);
      throw new Error(`Failed to update asset reserve: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update Certification Metadata - For certification workflow updates
   */
  async updateCertificationMetadata(params: {
    assetId: number;
    mnemonic: string;
    newCertificationData: any;
    newFiles: File[];
    formData: any;
  }): Promise<{
    txId: string;
    confirmedRound: number;
    newMetadataCid: string;
    newReserveAddress: string;
    metadataUrl: string;
    metadataCid: string;
    ipfsHashes?: {
      metadata: string;
      files: Array<{ name: string; hash: string }>;
    };
    uploadedFiles?: {
      license?: {name: string, gatewayUrl: string};
      image?: {name: string, gatewayUrl: string};
      attachments?: Array<{name: string, gatewayUrl: string}>;
    };
  }> {
    try {
      // Step 1: Upload new metadata to IPFS
      const ipfsResult = await this.ipfsService.uploadCertificationAssets(
        params.newFiles,
        params.newCertificationData,
        params.formData
      );

      // Step 2: Convert new CID to reserve address
      const newReserveAddress = this.fromCidToAddress(ipfsResult.metadataHash);

      // Step 3: Update asset reserve address
      const updateResult = await this.updateAssetReserve({
        assetId: params.assetId,
        newReserveAddress: newReserveAddress,
        managerMnemonic: params.mnemonic,
        metadataUrl: ipfsResult.metadataUrl
      });

      // Step 4: Prepare IPFS hashes and uploaded files info
      const ipfsHashes = {
        metadata: ipfsResult.metadataHash,
        files: ipfsResult.fileHashes.map(f => ({ name: f.name, hash: f.hash }))
      };

      // Organize uploaded files by type
      const uploadedFiles: any = {
        attachments: []
      };

      ipfsResult.individualFileUrls.forEach(file => {
        const fileName = file.name.toLowerCase();
        if (fileName.includes('license') || fileName.includes('licenza')) {
          uploadedFiles.license = {
            name: file.name,
            gatewayUrl: file.gatewayUrl
          };
        } else if (fileName.includes('image') || fileName.includes('img') || 
                   fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          uploadedFiles.image = {
            name: file.name,
            gatewayUrl: file.gatewayUrl
          };
        } else {
          uploadedFiles.attachments.push({
            name: file.name,
            gatewayUrl: file.gatewayUrl
          });
        }
      });

      return {
        txId: updateResult.txId,
        confirmedRound: updateResult.confirmedRound,
        newMetadataCid: ipfsResult.metadataHash,
        newReserveAddress: newReserveAddress,
        metadataUrl: ipfsResult.metadataUrl,
        metadataCid: ipfsResult.metadataHash,
        ipfsHashes,
        uploadedFiles
      };

    } catch (error) {
      console.error('❌ Error updating certification metadata:', error);
      throw new Error(`Failed to update certification metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default NFTMintingService; 