import { useState, useCallback } from 'react';
import { usePeraWallet } from './usePeraWallet';
import algosdk from 'algosdk';
import peraWalletService from '../services/peraWalletService';
import { algorandService } from '../services/algorand';
import IPFSService from '../services/ipfsService';
import { CidDecoder } from '../services/cidDecoder';
import { config } from '../config/environment';

// Type definitions
type StepState = 'pending' | 'active' | 'success' | 'error';

interface CertificationStep {
  id: string;
  title: string;
  description: string;
  state: StepState;
  error?: string;
  result?: any;
  details?: string; // Informazioni in tempo reale per l'utente
}

export interface PeraCertificationFlowParams {
  certificationData?: any;
  files: File[];
  assetName: string;
  unitName?: string;
  formData?: any;
  // Organization specific fields
  projectName?: string;
  description?: string;
  fileOrigin?: string;
  type?: string;
  customType?: string;
  organizationData?: any;
}

export interface PeraVersioningFlowParams {
  assetId?: number;
  existingAssetId?: number;
  existingReserveAddress?: string;
  newCertificationData: any;
  newFiles: File[];
  formData: any;
  certificationData?: any;
  files?: File[];
  assetName?: string;
  unitName?: string;
  isOrganization?: boolean;
  customJson?: any;
  onSuccess?: () => void;
  onModalOpen?: () => void;
}

export const usePeraCertificationFlow = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [steps, setSteps] = useState<CertificationStep[]>([]);
  
  const { isConnected, accountAddress } = usePeraWallet();
  const ipfsService = new IPFSService();

  // Simple stepper implementation
  const initializeSteps = useCallback((stepsList: CertificationStep[]) => {
    setSteps(stepsList);
  }, []);

  const updateStepState = useCallback((stepId: string, state: StepState, error?: string, result?: any, details?: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, state, error, result, details }
          : step
      )
    );
  }, []);

  const resetStep = useCallback((stepId: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, state: 'pending' as StepState, error: undefined }
          : step
      )
    );
  }, []);

  // Store current params and intermediate data for retry
  const [currentCertificationParams, setCurrentCertificationParams] = useState<PeraCertificationFlowParams | null>(null);
  const [currentVersioningParams, setCurrentVersioningParams] = useState<PeraVersioningFlowParams | null>(null);
  const [intermediateData, setIntermediateData] = useState<{
    ipfsResult?: any;
    reserveAddress?: string;
    assetId?: number;
    createTxId?: string;
  }>({});

  // Helper methods
  const getSuggestedParams = async (): Promise<algosdk.SuggestedParams> => {
    const algodClient = algorandService.getAlgod();
    return await algodClient.getTransactionParams().do();
  };

  const waitForConfirmation = async (txId: string): Promise<any> => {
    const algodClient = algorandService.getAlgod();
    let lastRound = (await algodClient.status().do()).lastRound;
    while (true) {
      const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
      if (pendingInfo.confirmedRound && pendingInfo.confirmedRound > 0) {
        return pendingInfo;
      }
      lastRound++;
      await algodClient.statusAfterBlock(lastRound).do();
    }
  };

  const formatTransactionForPera = (txn: algosdk.Transaction) => {
    if (!accountAddress) {
      throw new Error('Account address is required for transaction signing');
    }
    return {
      txn: txn,
      signers: [accountAddress]
    };
  };

  const initializeFlowSteps = useCallback((flowType: 'certification' | 'versioning') => {
    const baseSteps = [
      {
        id: 'wallet-check',
        title: 'Verifica Wallet',
        description: 'Verifica connessione Pera Wallet',
        state: 'pending' as StepState
      },
      {
        id: 'ipfs-upload',
        title: 'Caricamento su IPFS',
        description: 'Upload file e metadata su IPFS',
        state: 'pending' as StepState
      },
      {
        id: 'cid-conversion',
        title: 'Conversione CID',
        description: 'Conversione CID in indirizzo di riserva',
        state: 'pending' as StepState
      }
    ];

    if (flowType === 'certification') {
      baseSteps.push(
        {
          id: 'asset-creation',
          title: 'Creazione Asset',
          description: 'Firma transazione di creazione asset con Pera Wallet',
          state: 'pending' as StepState
        },
        {
          id: 'asset-config',
          title: 'Configurazione Asset',
          description: 'Firma transazione di aggiornamento reserve address con Pera Wallet',
          state: 'pending' as StepState
        }
      );
    } else {
      baseSteps.push({
        id: 'metadata-update',
        title: 'Aggiornamento Metadata',
        description: 'Firma aggiornamento con Pera Wallet',
        state: 'pending' as StepState
      });
    }

    initializeSteps(baseSteps);
  }, [initializeSteps]);

  const executeStep = useCallback(async (stepId: string, params: PeraCertificationFlowParams, currentData = intermediateData) => {

    
    try {
      switch (stepId) {
        case 'wallet-check':
          updateStepState(stepId, 'active', undefined, undefined, 'Verifica connessione wallet...');
          if (!isConnected || !accountAddress) {
            throw new Error('Pera Wallet non connesso. Effettua il login prima di procedere.');
          }
          updateStepState('wallet-check', 'success', undefined, undefined, `Wallet connesso: ${accountAddress?.slice(0, 8)}...`);
          return currentData;

        case 'ipfs-upload': {
          updateStepState(stepId, 'active', undefined, undefined, `Caricamento ${params.files?.length || 0} file su IPFS...`);
          
          const ipfsResult = await ipfsService.uploadCertificationAssets(
            params.files,
            params.certificationData,
            params.formData
          );
          
          const updatedData = { ...currentData, ipfsResult };
          setIntermediateData(updatedData);
          
          // Crea link IPFS per i details
          const ipfsLinks = [
            `📄 <a href="https://${config.pinataGateway}/ipfs/${ipfsResult.metadataHash}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Metadata IPFS</a>`
          ];
          
          if (ipfsResult.fileHashes && ipfsResult.fileHashes.length > 0) {
            ipfsResult.fileHashes.forEach((file: any) => {
              ipfsLinks.push(`📎 <a href="https://${config.pinataGateway}/ipfs/${file.hash}" target="_blank" style="color: #60a5fa; text-decoration: underline;">${file.name}</a>`);
            });
          }
          
          updateStepState('ipfs-upload', 'success', undefined, undefined, ipfsLinks.join('<br>'));
          return updatedData;
        }

        case 'cid-conversion': {

          
          updateStepState(stepId, 'active', undefined, undefined, 'Conversione CID in indirizzo Algorand...');
          
          if (!currentData.ipfsResult) {
            throw new Error('Dati IPFS mancanti');
          }
          
          if (!currentData.ipfsResult.metadataHash) {
            throw new Error('Metadata hash mancante nel risultato IPFS');
          }
          
          const reserveAddress = CidDecoder.fromCidToAddress(currentData.ipfsResult.metadataHash);
          
          const updatedData2 = { ...currentData, reserveAddress };
          setIntermediateData(updatedData2);
          updateStepState('cid-conversion', 'success', undefined, undefined, `Reserve address: ${reserveAddress.slice(0, 8)}...`);
          return updatedData2;
        }

        case 'asset-creation': {
          if (!currentData.reserveAddress || !currentData.ipfsResult) {
            throw new Error('Dati prerequisiti mancanti');
          }
          updateStepState(stepId, 'active', undefined, undefined, 'Creazione transazione asset...');
          
          const arc19TemplateUrl = "template-ipfs://{ipfscid:1:raw:reserve:sha2-256}#arc3";
          const suggestedParams = await getSuggestedParams();
          const algodClient = algorandService.getAlgod();

          const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
            sender: accountAddress!,
            total: 1,
            decimals: 0,
            assetName: params.assetName,
            unitName: params.unitName,
            assetURL: arc19TemplateUrl,
            defaultFrozen: true,
            manager: accountAddress!,
            reserve: currentData.reserveAddress!,
            freeze: undefined,
            clawback: undefined,
            suggestedParams,
          });

          updateStepState(stepId, 'active', undefined, undefined, 'Richiesta firma da Pera Wallet...');
          const signedCreateTxns = await peraWalletService.signTransaction([
            [formatTransactionForPera(assetCreateTxn)]
          ]);
          
          updateStepState(stepId, 'active', undefined, undefined, 'Invio transazione alla blockchain...');
          const createResponse = await algodClient.sendRawTransaction(signedCreateTxns[0]).do();
          const createTxId = createResponse.txid;
          updateStepState(stepId, 'active', undefined, undefined, `Attesa conferma: ${createTxId.slice(0, 12)}...`);
          
          const confirmedCreate = await waitForConfirmation(createTxId);
          
          let assetId = confirmedCreate['asset-index'] || 
                        confirmedCreate['created-asset-index'] || 
                        confirmedCreate.assetIndex || 
                        confirmedCreate.createdAssetIndex;

          if (!assetId && confirmedCreate.txn?.txn) {
            assetId = confirmedCreate.txn.txn['created-asset-index'] || 
                      confirmedCreate.txn.txn['asset-index'];
          }

          if (!assetId) {
            throw new Error('Failed to extract Asset ID from confirmed transaction');
          }
          const updatedData3 = { ...currentData, assetId, createTxId };
          setIntermediateData(updatedData3);
          
          // Crea link blockchain per asset e transazione
                  const explorerUrl = config.network.explorerUrl;
          const blockchainLinks = [
            `🔗 <a href="${explorerUrl}/asset/${assetId}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Asset ${assetId}</a>`,
            `📋 <a href="${explorerUrl}/tx/${createTxId}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Transazione</a>`
          ];
          
          updateStepState('asset-creation', 'success', undefined, undefined, blockchainLinks.join('<br>'));
          return updatedData3;
        }

        case 'asset-config': {
          if (!currentData.assetId || !currentData.reserveAddress) {
            throw new Error('Asset ID o reserve address mancanti');
          }
          updateStepState(stepId, 'active', undefined, undefined, 'Recupero informazioni asset...');
          const algodClientConfig = algorandService.getAlgod();
          
          // Assicurati che assetId sia un number, non BigInt
          const assetIdNumber = typeof currentData.assetId === 'bigint' 
            ? Number(currentData.assetId) 
            : currentData.assetId;
          
          const currentAssetInfo = await algodClientConfig.getAssetByID(assetIdNumber).do();
          
          const suggestedParamsConfig = await getSuggestedParams();

          const configParams = {
            sender: accountAddress!,
            assetIndex: assetIdNumber!,
            manager: currentAssetInfo.params.manager,
            reserve: currentData.reserveAddress,
            suggestedParams: suggestedParamsConfig,
            strictEmptyAddressChecking: false,
          };

          updateStepState(stepId, 'active', undefined, undefined, 'Richiesta firma configurazione...');
          const assetConfigTxn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject(configParams);
          const signedUpdateTxns = await peraWalletService.signTransaction([
            [formatTransactionForPera(assetConfigTxn)]
          ]);
          
          updateStepState(stepId, 'active', undefined, undefined, 'Invio configurazione alla blockchain...');
          const updateResponse = await algodClientConfig.sendRawTransaction(signedUpdateTxns[0]).do();
          const updateTxId = updateResponse.txid;
          updateStepState(stepId, 'active', undefined, undefined, `Attesa conferma: ${updateTxId.slice(0, 12)}...`);
          
          const confirmedUpdate = await waitForConfirmation(updateTxId);
          
          // Link finale con transazione di configurazione
                  const configExplorerUrl = config.network.explorerUrl;
          const configLinks = [
            `✅ Certificazione completata!`,
            `📋 <a href="${configExplorerUrl}/tx/${updateTxId}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Transazione Configurazione</a>`
          ];
          
          updateStepState('asset-config', 'success', undefined, undefined, configLinks.join('<br>'));

          // Completo - crea il risultato finale
          const finalResult = {
            assetId: currentData.assetId,
            txId: currentData.createTxId,
            updateTxId: updateTxId,
            confirmedRound: confirmedUpdate.confirmedRound || 0,
            assetAddress: accountAddress,
            metadataUrl: currentData.ipfsResult.metadataUrl,
            reserveAddress: currentData.reserveAddress,
            metadataCid: currentData.ipfsResult.metadataHash,
            ipfsHashes: {
              metadata: currentData.ipfsResult.metadataHash,
              files: currentData.ipfsResult.fileHashes.map((f: any) => ({ name: f.name, hash: f.hash }))
            }
          };

          setResult(finalResult);
          setIsProcessing(false);
          return currentData;
        }

        default:
          throw new Error(`Step sconosciuto: ${stepId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      updateStepState(stepId, 'error', errorMessage);
      throw error;
    }
  }, [isConnected, accountAddress, intermediateData, ipfsService, formatTransactionForPera, updateStepState]);

  const startCertificationFlow = useCallback(async (params: PeraCertificationFlowParams) => {
    setCurrentCertificationParams(params);
    setCurrentVersioningParams(null);
    setIntermediateData({});
    
    initializeFlowSteps('certification');
    setIsModalOpen(true);
    setIsProcessing(true);
    setResult(null);

    const stepOrder = ['wallet-check', 'ipfs-upload', 'cid-conversion', 'asset-creation', 'asset-config'];

    try {
      let currentData = {};
      for (const stepId of stepOrder) {
        const stepResult = await executeStep(stepId, params, currentData);
        if (stepResult) {
          currentData = stepResult;
        }
      }
    } catch (error) {
      setIsProcessing(false);
      // L'errore è già gestito in executeStep
    }
  }, [initializeFlowSteps, executeStep]);

  const startVersioningFlow = useCallback(async (params: PeraVersioningFlowParams) => {
    setCurrentVersioningParams(params);
    setCurrentCertificationParams(null);
    // Non resettare intermediateData se abbiamo già dei dati validi per il retry
    if (!intermediateData.ipfsResult) {
      setIntermediateData({});
    }
    
    initializeFlowSteps('versioning');
    setIsModalOpen(true);
    setIsProcessing(true);
    setResult(null);
    updateStepState('wallet-check', 'active', undefined, undefined, 'Verifica connessione wallet...');
    
    if (params.onModalOpen) {
      params.onModalOpen();
    }

    try {
      // Step 1: Verifica wallet
      if (!isConnected || !accountAddress) {
        throw new Error('Pera Wallet non connesso. Effettua il login prima di procedere.');
      }
      updateStepState('wallet-check', 'success', undefined, undefined, `Wallet connesso: ${accountAddress?.slice(0, 8)}...`);
      updateStepState('ipfs-upload', 'active', undefined, undefined, `Caricamento ${params.newFiles?.length || 0} file su IPFS...`);

        // Step 2: Upload IPFS - Usa dati intermedi se disponibili
        let ipfsResult = intermediateData.ipfsResult;
        if (!ipfsResult) {
          if (params.isOrganization && params.customJson) {
            // Use organization-specific upload method
            ipfsResult = await ipfsService.uploadOrganizationVersion(
              params.newFiles,
              params.customJson,
              params.formData
            );
          } else if (params.customJson) {
            // Use certification-specific upload method with custom JSON
            ipfsResult = await ipfsService.uploadCertificationVersion(
              params.newFiles,
              params.customJson,
              params.formData
            );
          } else {
            // Use standard certification upload method
            ipfsResult = await ipfsService.uploadCertificationAssets(
              params.newFiles,
              params.newCertificationData,
              params.formData
            );
          }
          setIntermediateData(prev => ({ ...prev, ipfsResult }));
        }
      
      // Crea link IPFS per versioning
      const versioningIpfsLinks = [
        `📄 <a href="https://${config.pinataGateway}/ipfs/${ipfsResult.metadataHash}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Metadata IPFS</a>`
      ];
      
      if (ipfsResult.fileHashes && ipfsResult.fileHashes.length > 0) {
        ipfsResult.fileHashes.forEach((file: any) => {
          versioningIpfsLinks.push(`📎 <a href="https://${config.pinataGateway}/ipfs/${file.hash}" target="_blank" style="color: #60a5fa; text-decoration: underline;">${file.name}</a>`);
        });
      }
      
      updateStepState('ipfs-upload', 'success', undefined, undefined, versioningIpfsLinks.join('<br>'));
      updateStepState('cid-conversion', 'active', undefined, undefined, 'Conversione CID in indirizzo Algorand...');

      // Step 3: Conversione CID - Usa reserve address se disponibile
      let reserveAddress = intermediateData.reserveAddress;
      if (!reserveAddress) {
        reserveAddress = CidDecoder.fromCidToAddress(ipfsResult.metadataHash);
        setIntermediateData(prev => ({ ...prev, reserveAddress }));
      }
      updateStepState('cid-conversion', 'success', undefined, undefined, `Reserve address: ${reserveAddress.slice(0, 8)}...`);
      updateStepState('metadata-update', 'active', undefined, undefined, 'Aggiornamento metadata su blockchain...');

      // Step 4: Aggiornamento metadata
      const algodClient = algorandService.getAlgod();
      const suggestedParams = await getSuggestedParams();
      
      // Gestisci sia certificazioni che organizzazioni
      const assetIdNumber = params.existingAssetId || 
        (typeof params.assetId === 'bigint' ? Number(params.assetId) : params.assetId);
      
      if (!assetIdNumber) {
        throw new Error('Asset ID mancante per il versioning');
      }
      
      
      const currentAssetInfo = await algodClient.getAssetByID(assetIdNumber).do();

      const configParams = {
        sender: accountAddress,
        assetIndex: assetIdNumber,
        manager: currentAssetInfo.params.manager,
        reserve: reserveAddress,
        suggestedParams,
        strictEmptyAddressChecking: false,
      };

      const assetConfigTxn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject(configParams);
      updateStepState('metadata-update', 'active', undefined, undefined, 'Richiesta firma da Pera Wallet...');
      const signedUpdateTxns = await peraWalletService.signTransaction([
        [formatTransactionForPera(assetConfigTxn)]
      ]);
      
      updateStepState('metadata-update', 'active', undefined, undefined, 'Invio aggiornamento alla blockchain...');
      const updateResponse = await algodClient.sendRawTransaction(signedUpdateTxns[0]).do();
      const updateTxId = updateResponse.txid;
      updateStepState('metadata-update', 'active', undefined, undefined, `Attesa conferma: ${updateTxId.slice(0, 12)}...`);
      const confirmedUpdate = await waitForConfirmation(updateTxId);

      // Link finale versioning con transazione
              const versioningExplorerUrl = config.network.explorerUrl;
      const versioningLinks = [
        `✅ Versioning completato!`,
        `📋 <a href="${versioningExplorerUrl}/tx/${updateTxId}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Transazione Aggiornamento</a>`
      ];
      
      updateStepState('metadata-update', 'success', undefined, undefined, versioningLinks.join('<br>'));

      const finalResult = {
        txId: updateTxId,
        confirmedRound: confirmedUpdate.confirmedRound || 0,
        newMetadataCid: ipfsResult.metadataHash,
        newReserveAddress: reserveAddress,
        metadataUrl: ipfsResult.metadataUrl,
        metadataCid: ipfsResult.metadataHash,
        ipfsHashes: {
          metadata: ipfsResult.metadataHash,
          files: ipfsResult.fileHashes.map((f: any) => ({ name: f.name, hash: f.hash }))
        },
        uploadedFiles: {
          attachments: ipfsResult.individualFileUrls.map((file: any) => ({
            name: file.name,
            gatewayUrl: file.gatewayUrl
          }))
        }
      };

      setResult(finalResult);
      setIsProcessing(false);
      return finalResult;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      const currentStep = steps.find(step => step.state === 'active');
      const failedStepId = currentStep?.id || 'metadata-update';
      updateStepState(failedStepId, 'error', errorMessage);
      setIsProcessing(false);
      throw error;
    }
  }, [initializeFlowSteps, updateStepState, isConnected, accountAddress, ipfsService, formatTransactionForPera, steps, intermediateData]);





  // Retry per versioning (più semplice)
  const retryVersioningFromStep = useCallback(async (stepId: string, params: PeraVersioningFlowParams) => {
    updateStepState(stepId, 'active', undefined, undefined, 'Riprova in corso...');

    try {
      switch (stepId) {
        case 'wallet-check':
          // Verifica wallet e prosegue
          updateStepState(stepId, 'active', undefined, undefined, 'Verifica connessione wallet...');
          if (!isConnected || !accountAddress) {
            throw new Error('Pera Wallet non connesso. Effettua il login prima di procedere.');
          }
          updateStepState('wallet-check', 'success', undefined, undefined, `Wallet connesso: ${accountAddress?.slice(0, 8)}...`);
          updateStepState('ipfs-upload', 'active', undefined, undefined, `Caricamento ${params.newFiles?.length || 0} file su IPFS...`);
          // Prosegue automaticamente con il prossimo step
          await retryVersioningFromStep('ipfs-upload', params);
          break;

        case 'ipfs-upload':
          // Controlla se abbiamo già i dati IPFS salvati
          if (intermediateData.ipfsResult) {
            // Usa i dati IPFS già caricati - crea link
            const existingIpfsLinks = [
              `📄 <a href="https://${config.pinataGateway}/ipfs/${intermediateData.ipfsResult.metadataHash}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Metadata IPFS</a>`
            ];
            
            if (intermediateData.ipfsResult.fileHashes && intermediateData.ipfsResult.fileHashes.length > 0) {
              intermediateData.ipfsResult.fileHashes.forEach((file: any) => {
                existingIpfsLinks.push(`📎 <a href="https://${config.pinataGateway}/ipfs/${file.hash}" target="_blank" style="color: #60a5fa; text-decoration: underline;">${file.name}</a>`);
              });
            }
            
            updateStepState('ipfs-upload', 'success', undefined, undefined, existingIpfsLinks.join('<br>'));
            updateStepState('cid-conversion', 'active', undefined, undefined, 'Conversione CID in indirizzo Algorand...');
            await retryVersioningFromStep('cid-conversion', params);
          } else {
            // Ricarica su IPFS solo se necessario
            updateStepState(stepId, 'active', undefined, undefined, `Caricamento ${params.newFiles?.length || 0} file su IPFS...`);
            const ipfsResult = await ipfsService.uploadCertificationAssets(
              params.newFiles,
              params.newCertificationData,
              params.formData
            );
            setIntermediateData(prev => ({ ...prev, ipfsResult }));
            
            // Crea link per nuovo upload
            const newIpfsLinks = [
              `📄 <a href="https://${config.pinataGateway}/ipfs/${ipfsResult.metadataHash}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Metadata IPFS</a>`
            ];
            
            if (ipfsResult.fileHashes && ipfsResult.fileHashes.length > 0) {
              ipfsResult.fileHashes.forEach((file: any) => {
                newIpfsLinks.push(`📎 <a href="https://${config.pinataGateway}/ipfs/${file.hash}" target="_blank" style="color: #60a5fa; text-decoration: underline;">${file.name}</a>`);
              });
            }
            
            updateStepState('ipfs-upload', 'success', undefined, undefined, newIpfsLinks.join('<br>'));
            updateStepState('cid-conversion', 'active', undefined, undefined, 'Conversione CID in indirizzo Algorand...');
            // Prosegue automaticamente
            await retryVersioningFromStep('cid-conversion', params);
          }
          break;

        case 'cid-conversion':
          // Usa IPFS result esistente o ricarica se necessario
          updateStepState(stepId, 'active', undefined, undefined, 'Conversione CID in indirizzo Algorand...');
          const currentIpfsResult = intermediateData.ipfsResult;
          if (!currentIpfsResult) {
            // Se non abbiamo i dati IPFS, riparti dall'upload
            await retryVersioningFromStep('ipfs-upload', params);
            return;
          }
          const newReserveAddress = CidDecoder.fromCidToAddress(currentIpfsResult.metadataHash);
          setIntermediateData(prev => ({ ...prev, reserveAddress: newReserveAddress }));
          updateStepState('cid-conversion', 'success', undefined, undefined, `Reserve address: ${newReserveAddress.slice(0, 8)}...`);
          updateStepState('metadata-update', 'active', undefined, undefined, 'Aggiornamento metadata su blockchain...');
          // Prosegue automaticamente
          await retryVersioningFromStep('metadata-update', params);
          break;

        case 'metadata-update':
          // Usa i dati IPFS e reserve address esistenti
          const currentReserveAddr = intermediateData.reserveAddress;
          const currentIpfsData = intermediateData.ipfsResult;
          
          if (!currentReserveAddr || !currentIpfsData) {
            // Se mancano dati, riparti dalla conversione CID
            await retryVersioningFromStep('cid-conversion', params);
            return;
          }

          // PRESERVA GLI STEP PRECEDENTI: assicurati che siano marcati come success
          updateStepState('wallet-check', 'success', undefined, undefined, `Wallet connesso: ${accountAddress?.slice(0, 8)}...`);
          
          // Ricrea link IPFS per step precedente
          const preservedIpfsLinks = [
            `📄 <a href="https://${config.pinataGateway}/ipfs/${currentIpfsData.metadataHash}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Metadata IPFS</a>`
          ];
          
          if (currentIpfsData.fileHashes && currentIpfsData.fileHashes.length > 0) {
            currentIpfsData.fileHashes.forEach((file: any) => {
              preservedIpfsLinks.push(`📎 <a href="https://${config.pinataGateway}/ipfs/${file.hash}" target="_blank" style="color: #60a5fa; text-decoration: underline;">${file.name}</a>`);
            });
          }
          
          updateStepState('ipfs-upload', 'success', undefined, undefined, preservedIpfsLinks.join('<br>'));
          updateStepState('cid-conversion', 'success', undefined, undefined, `Reserve address: ${currentReserveAddr.slice(0, 8)}...`);

          // Aggiornamento metadata dell'asset esistente
          updateStepState(stepId, 'active', undefined, undefined, 'Recupero informazioni asset...');
          const algodClient = algorandService.getAlgod();
          const suggestedParams = await getSuggestedParams();
          
          // Gestisci sia certificazioni che organizzazioni
          const retryAssetIdNumber = params.existingAssetId || 
            (typeof params.assetId === 'bigint' ? Number(params.assetId) : params.assetId);
          
          if (!retryAssetIdNumber) {
            throw new Error('Asset ID mancante per il retry');
          }
  
          
          const currentAssetInfo = await algodClient.getAssetByID(retryAssetIdNumber).do();

          const configParams = {
            sender: accountAddress!,
            assetIndex: retryAssetIdNumber,
            manager: currentAssetInfo.params.manager,
            reserve: currentReserveAddr,
            suggestedParams,
            strictEmptyAddressChecking: false,
          };

          updateStepState(stepId, 'active', undefined, undefined, 'Richiesta firma da Pera Wallet...');
          const assetConfigTxn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject(configParams);
          const signedUpdateTxns = await peraWalletService.signTransaction([
            [formatTransactionForPera(assetConfigTxn)]
          ]);
          
          updateStepState(stepId, 'active', undefined, undefined, 'Invio aggiornamento alla blockchain...');
          const updateResponse = await algodClient.sendRawTransaction(signedUpdateTxns[0]).do();
          const updateTxId = updateResponse.txid;
          updateStepState(stepId, 'active', undefined, undefined, `Attesa conferma: ${updateTxId.slice(0, 12)}...`);
          const confirmedUpdate = await waitForConfirmation(updateTxId);

          // Link finale retry versioning con transazione  
                  const retryExplorerUrl = config.network.explorerUrl;
          const retryVersioningLinks = [
            `✅ Versioning completato!`,
            `📋 <a href="${retryExplorerUrl}/tx/${updateTxId}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Transazione Aggiornamento</a>`
          ];
          
          updateStepState('metadata-update', 'success', undefined, undefined, retryVersioningLinks.join('<br>'));

          const finalResult = {
            txId: updateTxId,
            confirmedRound: confirmedUpdate.confirmedRound || 0,
            newMetadataCid: currentIpfsData.metadataHash,
            newReserveAddress: currentReserveAddr,
            metadataUrl: currentIpfsData.metadataUrl,
            metadataCid: currentIpfsData.metadataHash,
            ipfsHashes: {
              metadata: currentIpfsData.metadataHash,
              files: currentIpfsData.fileHashes.map((f: any) => ({ name: f.name, hash: f.hash }))
            },
            uploadedFiles: {
              attachments: currentIpfsData.individualFileUrls.map((file: any) => ({
                name: file.name,
                gatewayUrl: file.gatewayUrl
              }))
            }
          };

          setResult(finalResult);
          setIsProcessing(false);
          break;

        default:
          // Se è uno step sconosciuto, riavvia tutto
          throw new Error(`Step sconosciuto: ${stepId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      updateStepState(stepId, 'error', errorMessage);
      setIsProcessing(false);
      throw error;
    }
  }, [intermediateData, accountAddress, updateStepState, formatTransactionForPera, isConnected, ipfsService]);

  // SMART RETRY: Riprende solo dallo step fallito preservando i dati intermedi
  const retryStep = useCallback(async (stepId: string) => {
    if (!currentCertificationParams && !currentVersioningParams) {
      return;
    }

    // Reset solo lo step fallito
    resetStep(stepId);
    setIsProcessing(true);

    try {
      if (currentCertificationParams) {
        let currentData = intermediateData;
        const stepResult = await executeStep(stepId, currentCertificationParams, currentData);
        if (stepResult) {
          currentData = stepResult;
        }
        
        // Se il retry ha successo, continua con gli step successivi
        const stepOrder = ['wallet-check', 'ipfs-upload', 'cid-conversion', 'asset-creation', 'asset-config'];
        const currentIndex = stepOrder.indexOf(stepId);
        
        if (currentIndex >= 0 && currentIndex < stepOrder.length - 1) {
          for (let i = currentIndex + 1; i < stepOrder.length; i++) {
            const nextStepResult = await executeStep(stepOrder[i], currentCertificationParams, currentData);
            if (nextStepResult) {
              currentData = nextStepResult;
            }
          }
        }
      } else if (currentVersioningParams) {
        await retryVersioningFromStep(stepId, currentVersioningParams);
      }
    } catch (error) {
      setIsProcessing(false);
      // L'errore è già gestito in executeStep
    }
  }, [currentCertificationParams, currentVersioningParams, executeStep, retryVersioningFromStep, resetStep]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setResult(null);
    setIsProcessing(false);
    setCurrentCertificationParams(null);
    setCurrentVersioningParams(null);
    setIntermediateData({});
  }, []);

  return {
    isModalOpen,
    isProcessing,
    result,
    steps,
    startCertificationFlow,
    startVersioningFlow,
    retryStep,
    closeModal,
    isWalletConnected: isConnected,
    walletAddress: accountAddress
  };
};
