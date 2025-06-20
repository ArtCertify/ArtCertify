import { useState, useCallback } from 'react';
import { type CertificationStep } from '../components/modals/CertificationModal';
import { type StepState } from '../components/ui/Stepper';
import NFTMintingService from '../services/nftMintingService';

export interface CertificationFlowParams {
  mnemonic: string;
  certificationData: any;
  files: File[];
  assetName: string;
  unitName: string;
  formData: any;
}

export interface VersioningFlowParams {
  assetId: number;
  mnemonic: string;
  newCertificationData: any;
  newFiles: File[];
  formData: any;
  onSuccess?: () => void;
  onModalOpen?: () => void; // Callback per chiudere il modale parent
}

export const useCertificationFlow = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [steps, setSteps] = useState<CertificationStep[]>([]);

  const initializeSteps = useCallback((flowType: 'certification' | 'versioning') => {
    const baseSteps: CertificationStep[] = [
      {
        id: 'ipfs-upload',
        title: 'Caricamento su IPFS',
        description: 'Upload file e metadata su IPFS',
        state: 'pending'
      },
      {
        id: 'cid-conversion',
        title: 'Conversione CID',
        description: 'Conversione CID in indirizzo di riserva',
        state: 'pending'
      }
    ];

    if (flowType === 'certification') {
      baseSteps.push({
        id: 'asset-creation',
        title: 'Creazione Asset',
        description: 'Creazione SBT sulla blockchain',
        state: 'pending'
      });
    } else {
      baseSteps.push({
        id: 'metadata-update',
        title: 'Aggiornamento Metadata',
        description: 'Aggiornamento metadata sulla blockchain',
        state: 'pending'
      });
    }

    setSteps(baseSteps);
  }, []);

  const updateStepState = useCallback((stepId: string, state: StepState, error?: string, result?: any) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, state, error, result }
          : step
      )
    );
  }, []);

  const resetStep = useCallback((stepId: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, state: 'pending', error: undefined }
          : step
      )
    );
  }, []);

  const startCertificationFlow = useCallback(async (params: CertificationFlowParams) => {
    // Feedback immediato: apri il modale e mostra il primo step attivo
    initializeSteps('certification');
    setIsModalOpen(true);
    setIsProcessing(true);
    setResult(null);
    updateStepState('ipfs-upload', 'active');

    const nftMintingService = new NFTMintingService();

    try {
      // Esegui il processo reale in background
      try {
        const finalResult = await nftMintingService.mintCertificationSBT({
          mnemonic: params.mnemonic,
          certificationData: params.certificationData,
          files: params.files,
          assetName: params.assetName,
          unitName: params.unitName,
          formData: params.formData
        });
        
        // Aggiorna gli step in sequenza quando completati
        updateStepState('ipfs-upload', 'success');
        updateStepState('cid-conversion', 'active');
        
        // Breve delay per mostrare progressione
        await new Promise(resolve => setTimeout(resolve, 500));
        updateStepState('cid-conversion', 'success');
        updateStepState('asset-creation', 'active');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        updateStepState('asset-creation', 'success', undefined, finalResult);
        
        setResult(finalResult);
        setIsProcessing(false);
        
        return finalResult;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        
        // Determine which step failed
        if (errorMessage.includes('IPFS') || errorMessage.includes('upload')) {
          updateStepState('ipfs-upload', 'error', errorMessage);
        } else if (errorMessage.includes('CID') || errorMessage.includes('address')) {
          updateStepState('cid-conversion', 'error', errorMessage);
        } else {
          updateStepState('asset-creation', 'error', errorMessage);
        }
        
        setIsProcessing(false);
        throw error;
      }
      
    } catch (error) {
      setIsProcessing(false);
      console.error('Certification flow error:', error);
    }
  }, [initializeSteps, updateStepState]);

  const startVersioningFlow = useCallback(async (params: VersioningFlowParams) => {
    // Feedback immediato: apri il modale e mostra il primo step attivo
    initializeSteps('versioning');
    setIsModalOpen(true);
    setIsProcessing(true);
    setResult(null);
    updateStepState('ipfs-upload', 'active');
    
    // Chiama il callback per chiudere il modale parent (ModifyAttachmentsModal)
    if (params.onModalOpen) {
      params.onModalOpen();
    }

    const nftMintingService = new NFTMintingService();

    try {
      // Esegui il processo reale in background
      const finalResult = await nftMintingService.updateCertificationMetadata({
        assetId: params.assetId,
        mnemonic: params.mnemonic,
        newCertificationData: params.newCertificationData,
        newFiles: params.newFiles,
        formData: params.formData
      });
      
      // Aggiorna gli step in sequenza quando completati
      updateStepState('ipfs-upload', 'success');
      updateStepState('cid-conversion', 'active');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepState('cid-conversion', 'success');
      updateStepState('metadata-update', 'active');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepState('metadata-update', 'success', undefined, finalResult);
      
      setResult(finalResult);
      setIsProcessing(false);
      
      // Non chiamare più il callback automaticamente - sarà gestito dalla UI
      
      return finalResult;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      
      // Determine which step failed
      if (errorMessage.includes('IPFS') || errorMessage.includes('upload')) {
        updateStepState('ipfs-upload', 'error', errorMessage);
      } else if (errorMessage.includes('CID') || errorMessage.includes('address')) {
        updateStepState('cid-conversion', 'error', errorMessage);
      } else {
        updateStepState('metadata-update', 'error', errorMessage);
      }
      
      setIsProcessing(false);
      throw error;
    }
  }, [initializeSteps, updateStepState]);

  const retryStep = useCallback(async (stepId: string) => {
    resetStep(stepId);
    // Reset all subsequent steps
    const stepIndex = steps.findIndex(step => step.id === stepId);
    steps.slice(stepIndex + 1).forEach(step => {
      resetStep(step.id);
    });
    
    // TODO: Implement retry logic based on step
    // This would require refactoring the flow to allow individual step execution
    console.log(`Retrying step: ${stepId}`);
  }, [steps, resetStep]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSteps([]);
    setResult(null);
    setIsProcessing(false);
  }, []);

  const cancelFlow = useCallback(() => {
    setIsProcessing(false);
    closeModal();
  }, [closeModal]);

  return {
    isModalOpen,
    isProcessing,
    result,
    steps,
    startCertificationFlow,
    startVersioningFlow,
    retryStep,
    closeModal,
    cancelFlow
  };
}; 