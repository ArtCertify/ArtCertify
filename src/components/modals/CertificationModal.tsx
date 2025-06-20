import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { X, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { Stepper, Step, type StepState } from '../ui/Stepper';
import Button from '../ui/Button';
import { config } from '../../config/environment';

export interface CertificationStep {
  id: string;
  title: string;
  description?: string;
  state: StepState;
  error?: string;
  result?: unknown;
}

interface MintingResult {
  assetId?: number;
  txId?: string;
  metadataCid?: string;
  ipfsHashes?: {
    files?: Array<{name: string, hash: string}>;
    metadata?: string;
  };
  uploadedFiles?: {
    license?: {name: string, gatewayUrl: string};
    image?: {name: string, gatewayUrl: string};
    attachments?: Array<{name: string, gatewayUrl: string}>;
  };
  [key: string]: unknown;
}

export interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  steps: CertificationStep[];
  onRetryStep: (stepId: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
  result?: MintingResult;
  onSuccess?: (result: MintingResult) => void;
}

export const CertificationModal: React.FC<CertificationModalProps> = ({
  isOpen,
  onClose,
  title,
  steps,
  onRetryStep,
  onCancel,
  isProcessing,
  result,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // Update current step based on steps state
  useEffect(() => {
    const activeStepIndex = steps.findIndex(step => step.state === 'active');
    const completedSteps = steps.filter(step => step.state === 'success').length;
    
    if (activeStepIndex !== -1) {
      setCurrentStep(activeStepIndex + 1);
    } else if (completedSteps === steps.length && completedSteps > 0) {
      setCurrentStep(steps.length + 1); // All completed
    }
  }, [steps]);

  const hasErrors = steps.some(step => step.state === 'error');
  const isCompleted = steps.every(step => step.state === 'success') && !isProcessing;
  
  // Determine explorer URL based on network
  const getExplorerUrl = () => {
    return config.algorandNetwork === 'MainNet' 
      ? 'https://explorer.perawallet.app' 
      : 'https://testnet.explorer.perawallet.app';
  };

  const handleClose = () => {
    if (!isProcessing && (isCompleted || !hasErrors)) {
      if (isCompleted && result && onSuccess) {
        onSuccess(result);
      }
      onClose();
    }
  };

  const canClose = !isProcessing && (isCompleted || hasErrors);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-slate-800 border border-slate-700 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-white"
                  >
                    {title}
                  </Dialog.Title>
                  {canClose && (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      onClick={handleClose}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Status Message */}
                {isProcessing && (
                  <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-300">
                      Processo di certificazione in corso... Non chiudere questa finestra.
                    </p>
                  </div>
                )}

                {isCompleted && (
                  <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-300">
                      ✅ Certificazione completata con successo!
                    </p>
                  </div>
                )}

                {hasErrors && !isProcessing && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-300 font-medium">
                          Errori durante la certificazione
                        </p>
                        <p className="text-xs text-red-400 mt-1">
                          Utilizza il pulsante "Riprova" sui passaggi falliti per ripetere l'operazione.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stepper */}
                <div className="mb-6">
                                   <Stepper activeStep={currentStep} className="space-y-4">
                   {steps.map((step) => (
                     <Step
                       key={step.id}
                       title={step.title}
                       description={step.description}
                       customState={step.state}
                       onClick={
                         step.state === 'error' 
                           ? () => onRetryStep(step.id)
                           : undefined
                       }
                     />
                   ))}
                 </Stepper>
                </div>

                {/* Error Details */}
                {hasErrors && (
                  <div className="mb-6 space-y-2">
                    {steps
                      .filter(step => step.state === 'error' && step.error)
                      .map(step => (
                        <div key={step.id} className="p-3 bg-red-900/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-red-300">
                                {step.title}
                              </p>
                              <p className="text-xs text-red-400 mt-1">
                                {step.error}
                              </p>
                            </div>
                                                         <Button
                               size="sm"
                               variant="secondary"
                               onClick={() => onRetryStep(step.id)}
                               className="text-red-300 border-red-500/30 hover:bg-red-900/20"
                             >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Riprova
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                                {/* Success Summary with Essential Links */}
                {isCompleted && result && (
                  <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-400">Processo Completato!</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {/* Blockchain Links */}
                      {result.assetId && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">🔗</span>
                          <a 
                            href={`${getExplorerUrl()}/asset/${result.assetId}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            Visualizza Asset su Blockchain
                          </a>
                        </div>
                      )}
                      
                      {result.txId && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">📋</span>
                          <a 
                            href={`${getExplorerUrl()}/tx/${result.txId}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            Visualizza Transazione
                          </a>
                        </div>
                      )}
                      
                      {/* IPFS Files */}
                      {result.metadataCid && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">📄</span>
                          <a 
                            href={`https://${config.pinataGateway}/ipfs/${result.metadataCid}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            Visualizza Metadata IPFS
                          </a>
                        </div>
                      )}
                      
                      {/* File IPFS - Mostra uploadedFiles se disponibili (versioning), altrimenti ipfsHashes (certificazione) */}
                      {result.uploadedFiles ? (
                        <>
                          {/* File da versioning con organizzazione per tipo */}
                          {result.uploadedFiles.license && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">📄</span>
                              <a 
                                href={result.uploadedFiles.license.gatewayUrl}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-400 hover:text-blue-300 underline"
                              >
                                {result.uploadedFiles.license.name}
                              </a>
                            </div>
                          )}
                          
                          {result.uploadedFiles.image && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">🖼️</span>
                              <a 
                                href={result.uploadedFiles.image.gatewayUrl}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-400 hover:text-blue-300 underline"
                              >
                                {result.uploadedFiles.image.name}
                              </a>
                            </div>
                          )}
                          
                          {result.uploadedFiles.attachments?.map((att: {name: string, gatewayUrl: string}, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-slate-400">📎</span>
                              <a 
                                href={att.gatewayUrl}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-400 hover:text-blue-300 underline"
                              >
                                {att.name}
                              </a>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          {/* File da certificazione standard */}
                          {result.ipfsHashes?.files?.map((file: {name: string, hash: string}, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-slate-400">📎</span>
                              <a 
                                href={`https://${config.pinataGateway}/ipfs/${file.hash}`}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-400 hover:text-blue-300 underline"
                              >
                                {file.name}
                              </a>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  {!isCompleted && !isProcessing && (
                    <Button
                      variant="secondary"
                      onClick={onCancel}
                      disabled={isProcessing}
                    >
                      Annulla
                    </Button>
                  )}
                  
                  {isCompleted && result?.assetId && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          handleClose();
                          // Navigate to dashboard
                          navigate('/');
                        }}
                      >
                        Torna alla Dashboard
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          handleClose();
                          // Navigate to asset details
                          navigate(`/asset/${result.assetId}`);
                        }}
                      >
                        Visualizza Asset
                      </Button>
                    </>
                  )}

                  {isCompleted && !result?.assetId && (
                    <Button
                      variant="primary"
                      onClick={handleClose}
                    >
                      Chiudi
                    </Button>
                  )}

                  {hasErrors && !isProcessing && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        const errorSteps = steps.filter(step => step.state === 'error');
                        if (errorSteps.length > 0) {
                          onRetryStep(errorSteps[0].id);
                        }
                      }}
                    >
                      Riprova Tutto
                    </Button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 