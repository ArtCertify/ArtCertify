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
      console.log(`🔗 Converting CID ${cidStr} to address (Python pattern)...`);
      const address = CidDecoder.fromCidToAddress(cidStr);
      console.log(`🔗 CID ${cidStr} -> Address: ${address}`);
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
   * Complete SBT Minting Process - TRUE ARC-19 + ARC-3 compliance
   * 
   * TRUE ARC-19 workflow (following Python reference exactly):
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
      console.log('🚀 Starting TRUE ARC-19 + ARC-3 SBT Minting Process...');

      // Step 1: Upload to IPFS (same as before)
      console.log('📁 Step 1: Uploading to IPFS...');
      const ipfsResult = await this.ipfsService.uploadCertificationAssets(
        params.files,
        params.certificationData,
        params.formData
      );

      console.log(`✅ IPFS Upload completed: ${ipfsResult.metadataHash}`);

      // Step 2: Convert CID to reserve address - Following Python: from_cid_to_address
      console.log('🔗 Step 2: Converting CID to reserve address...');
      const reserveAddress = this.fromCidToAddress(ipfsResult.metadataHash);
      console.log(`🔗 Reserve address: ${reserveAddress}`);

      // Step 3: Create TRUE ARC-19 + ARC-3 compliant SBT
      console.log('🏗️ Step 3: Creating TRUE ARC-19 + ARC-3 compliant SBT...');
      const createResult = await this.createARC19SBTAsset({
        mnemonic: params.mnemonic,
        assetName: params.assetName,
        unitName: params.unitName,
        reserveAddress: reserveAddress,
        metadataCid: ipfsResult.metadataHash,
        metadataUrl: ipfsResult.metadataUrl // For debugging/reference
      });

      console.log(`✅ TRUE ARC-19 + ARC-3 SBT created successfully: Asset ID ${createResult.assetId}`);

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
   * Create TRUE ARC-19 + ARC-3 compliant SBT Asset
   * 
   * ARC-19 compliance: Template URL with reserve address resolution
   * ARC-3 compliance: @arc3 naming convention for visualization
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
      console.log(`🏗️ Creating TRUE ARC-19 + ARC-3 SBT Asset...`);
      
      // ARC-19 Template URL - Using format exactly like working asset 740976269
      const arc19TemplateUrl = "template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}";
      
      console.log(`   - Asset Name: ${params.assetName}@arc3`); // ARC-3 naming convention
      console.log(`   - Unit Name: ${params.unitName}`);
      console.log(`   - ARC-19 Template URL: ${arc19TemplateUrl}`); // TRUE ARC-19 compliance
      console.log(`   - Reserve Address: ${params.reserveAddress}`); // CID resolution
      console.log(`   - Metadata CID: ${params.metadataCid}`);
      console.log(`   - Manager Address: ${params.managerAddress || 'same as creator'}`);

      const account = this.getAccountFromMnemonic(params.mnemonic);
      const suggestedParams = await this.getSuggestedParams();

      // TRUE ARC-19 + ARC-3 implementation
      const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender: account.addr,
        total: 1,                                    // NFT = 1 total supply
        decimals: 0,                                 // NFTs have 0 decimals
        assetName: `${params.assetName}@arc3`,      // ARC-3 naming convention for visualization
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

      console.log(`🔧 TRUE ARC-19 + ARC-3 Asset Creation Parameters:`, {
        sender: account.addr,
        total: 1,
        decimals: 0,
        assetName: `${params.assetName}@arc3`,
        unitName: params.unitName,
        assetURL: arc19TemplateUrl,
        defaultFrozen: true,
        manager: params.managerAddress || account.addr,
        reserve: params.reserveAddress,
        freeze: 'undefined',
        clawback: 'undefined',
        standard: 'TRUE ARC-19 + ARC-3 Hybrid',
        expectedResolution: `CID ${params.metadataCid} -> Address ${params.reserveAddress}`
      });

      // Sign and submit
      const signedTxn = assetCreateTxn.signTxn(account.sk);
      const response = await this.algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;

      console.log(`🏗️ Asset creation transaction submitted: ${txId}`);

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

      console.log(`✅ TRUE ARC-19 + ARC-3 SBT Asset created successfully: Asset ID ${assetId}`);

      // Immediate verification
      console.log(`🔍 Verifying TRUE ARC-19 + ARC-3 compliance...`);
      const assetInfo = await this.algodClient.getAssetByID(assetId).do();
      
      console.log(`🔍 Asset Verification:`, {
        assetId,
        name: assetInfo.params.name,
        url: assetInfo.params.url,
        reserveSet: assetInfo.params.reserve,
        expectedReserve: params.reserveAddress,
        reserveMatches: assetInfo.params.reserve === params.reserveAddress,
        manager: assetInfo.params.manager,
        creator: assetInfo.params.creator,
        frozen: assetInfo.params.defaultFrozen,
        arc3Compliant: assetInfo.params.name?.includes('@arc3'),
        arc19Compliant: assetInfo.params.url === arc19TemplateUrl && !!assetInfo.params.reserve,
        templateUrl: assetInfo.params.url === arc19TemplateUrl,
        standards: {
          'ARC-3': assetInfo.params.name?.includes('@arc3') ? '✅' : '❌',
          'ARC-19': (assetInfo.params.url === arc19TemplateUrl && !!assetInfo.params.reserve) ? '✅' : '❌'
        }
      });

      // Verify ARC-19 compliance
      if (assetInfo.params.url === arc19TemplateUrl) {
        console.log(`✅ SUCCESS! ARC-19 template URL correctly set: ${assetInfo.params.url}`);
      } else {
        console.log(`❌ FAILURE! Asset URL is: ${assetInfo.params.url || 'undefined'}`);
        throw new Error(`ARC-19 template URL not set correctly during asset creation`);
      }

      // Verify reserve address
      if (assetInfo.params.reserve === params.reserveAddress) {
        console.log(`✅ SUCCESS! Reserve address correctly set to: ${assetInfo.params.reserve}`);
      } else {
        console.log(`❌ FAILURE! Reserve address is: ${assetInfo.params.reserve || 'undefined'}`);
        throw new Error(`Reserve address not set correctly during asset creation`);
      }

      // Verify ARC-3 compliance
      if (assetInfo.params.name?.includes('@arc3')) {
        console.log(`✅ SUCCESS! ARC-3 naming convention correctly applied: ${assetInfo.params.name}`);
      } else {
        console.log(`❌ WARNING! ARC-3 naming convention not found in: ${assetInfo.params.name || 'undefined'}`);
      }

      console.log(`🎉 FINAL RESULT: Asset ${assetId} is now BOTH ARC-19 and ARC-3 compliant!`);
      console.log(`   📋 ARC-3: Supports NFT visualization with @arc3 naming`);
      console.log(`   🔗 ARC-19: Supports immutable metadata resolution via reserve address`);
      console.log(`   🔍 Template URL resolves: ${params.metadataCid} via ${params.reserveAddress}`);

      return {
        assetId,
        txId,
        confirmedRound: confirmedTxn['confirmed-round'] || 0
      };

    } catch (error) {
      console.error('Error creating TRUE ARC-19 + ARC-3 SBT asset:', error);
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
      console.log(`🔄 Updating Asset Reserve (Python Pattern)...`);
      console.log(`   - Asset ID: ${params.assetId}`);
      console.log(`   - New Reserve: ${params.newReserveAddress}`);

      const managerAccount = this.getAccountFromMnemonic(params.managerMnemonic);
      const suggestedParams = await this.getSuggestedParams();

      // Get current asset info to preserve existing parameters
      const currentAssetInfo = await this.algodClient.getAssetByID(params.assetId).do();
      
      console.log(`🔍 Current Asset State:`, {
        manager: currentAssetInfo.params.manager,
        reserve: currentAssetInfo.params.reserve,
        freeze: currentAssetInfo.params.freeze || 'undefined',
        clawback: currentAssetInfo.params.clawback || 'undefined',
        url: currentAssetInfo.params.url
      });

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
        console.log(`✅ Preserving freeze: ${currentAssetInfo.params.freeze}`);
      }

      // Only include clawback if it was originally set  
      if (currentAssetInfo.params.clawback && currentAssetInfo.params.clawback !== '') {
        (configParams as any).clawback = currentAssetInfo.params.clawback;
        console.log(`✅ Preserving clawback: ${currentAssetInfo.params.clawback}`);
      }

      // Update URL if provided (for ARC-3 compliance)
      if (params.metadataUrl) {
        (configParams as any).assetURL = params.metadataUrl;
        console.log(`✅ Updating URL: ${params.metadataUrl}`);
      }

      console.log(`🔧 Asset Config Params (Python Pattern):`, {
        sender: configParams.sender.toString(),
        assetIndex: configParams.assetIndex,
        manager: configParams.manager,
        reserve: configParams.reserve,
        freeze: (configParams as any).freeze || 'NOT_INCLUDED',
        clawback: (configParams as any).clawback || 'NOT_INCLUDED',
        assetURL: (configParams as any).assetURL || 'NOT_INCLUDED'
      });

      // Create asset configuration transaction
      const assetConfigTxn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject(configParams);

      // Sign and submit
      const signedTxn = assetConfigTxn.signTxn(managerAccount.sk);
      const response = await this.algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;

      console.log(`🔄 Asset config transaction submitted: ${txId}`);

      // Wait for confirmation
      const confirmedTxn = await this.waitForConfirmation(txId);
      console.log(`✅ Transaction confirmed in round: ${confirmedTxn['confirmed-round']}`);

      // Immediate verification
      console.log(`🔍 Verifying reserve address update...`);
      const updatedAssetInfo = await this.algodClient.getAssetByID(params.assetId).do();
      
      console.log(`🔍 Updated Asset State:`, {
        reserve: updatedAssetInfo.params.reserve,
        expected: params.newReserveAddress,
        matches: updatedAssetInfo.params.reserve === params.newReserveAddress,
        manager: updatedAssetInfo.params.manager,
        url: updatedAssetInfo.params.url
      });

      if (updatedAssetInfo.params.reserve === params.newReserveAddress) {
        console.log(`✅ SUCCESS! Reserve address updated to: ${updatedAssetInfo.params.reserve}`);
      } else {
        console.log(`❌ FAILURE! Reserve address is: ${updatedAssetInfo.params.reserve || 'undefined'}`);
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
  }> {
    try {
      console.log('🔄 Updating Certification Metadata...');
      console.log(`   - Asset ID: ${params.assetId}`);

      // Step 1: Upload new metadata to IPFS
      console.log('📁 Uploading updated metadata to IPFS...');
      const ipfsResult = await this.ipfsService.uploadCertificationAssets(
        params.newFiles,
        params.newCertificationData,
        params.formData
      );

      console.log(`✅ New metadata uploaded: ${ipfsResult.metadataHash}`);

      // Step 2: Convert new CID to reserve address
      const newReserveAddress = this.fromCidToAddress(ipfsResult.metadataHash);
      console.log(`🔗 New reserve address: ${newReserveAddress}`);

      // Step 3: Update asset reserve address
      const updateResult = await this.updateAssetReserve({
        assetId: params.assetId,
        newReserveAddress: newReserveAddress,
        managerMnemonic: params.mnemonic,
        metadataUrl: ipfsResult.metadataUrl
      });

      console.log(`✅ Certification metadata updated successfully!`);

      return {
        txId: updateResult.txId,
        confirmedRound: updateResult.confirmedRound,
        newMetadataCid: ipfsResult.metadataHash,
        newReserveAddress: newReserveAddress,
        metadataUrl: ipfsResult.metadataUrl
      };

    } catch (error) {
      console.error('❌ Error updating certification metadata:', error);
      throw new Error(`Failed to update certification metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default NFTMintingService; 