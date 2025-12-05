import React, { useState, useRef, useEffect, Fragment } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CloudArrowUpIcon, DocumentDuplicateIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { Alert, FilePreviewDisplay } from '../ui';
import type { AssetInfo } from '../../services/algorand';
import { CertificationModal } from './CertificationModal';
import { usePeraCertificationFlow } from '../../hooks/usePeraCertificationFlow';
import type { IPFSMetadata } from '../../hooks/useIPFSMetadata';
import { IPFSUrlService } from '../../services/ipfsUrlService';
import MinIOService from '../../services/minioServices';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface ModifyAttachmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetInfo;
  currentAttachments?: Attachment[];
  ipfsMetadata?: IPFSMetadata | null; // Metadati IPFS per popolare i campi
  onAssetUpdated?: () => void; // Callback per aggiornare i dati dell'asset
}

const ModifyAttachmentsModal: React.FC<ModifyAttachmentsModalProps> = ({
  isOpen,
  onClose,
  asset,
  currentAttachments = [],
  ipfsMetadata,
  onAssetUpdated
}) => {
  // Versioning flow hook with Pera Wallet
  const {
    isModalOpen: isVersioningModalOpen,
    isProcessing: isVersioningProcessing,
    result: versioningResult,
    steps: versioningSteps,
    startVersioningFlow,
    retryStep: retryVersioningStep,
    closeModal: closeVersioningModal,

    isWalletConnected,
    walletAddress
  } = usePeraCertificationFlow();


  // Versioning info
  const [versionInfo, setVersionInfo] = useState({
    nextVersion: 1,
    previousVersion: {
      version: 0,
      cid: '',
      ipfsLink: ''
    }
  });

  const [attachments, setAttachments] = useState<Attachment[]>(currentAttachments);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentCertJson, setCurrentCertJson] = useState<any>(null);
  const [loadingCurrentJson, setLoadingCurrentJson] = useState(false);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [isUploadingToMinio, setIsUploadingToMinio] = useState(false);
  const [minioUploadError, setMinioUploadError] = useState<string | null>(null);

  const minioService = new MinIOService();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Helper function to get image URL (supports both IPFS and MINIO URLs)
  const getImageUrl = (url: string): string => {
    if (!url) return '';
    // If it's already a full URL (MINIO or gateway), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it's an IPFS URL, convert to gateway URL
    if (url.startsWith('ipfs://')) {
      const hash = url.replace('ipfs://', '');
      return IPFSUrlService.getGatewayUrl(hash);
    }
    return url;
  };

  // Form state - prioritizza i metadati IPFS
  const [formData, setFormData] = useState({
    // Campi non modificabili (da IPFS)
    projectName: ipfsMetadata?.properties?.form_data?.projectName || '',
    assetName: ipfsMetadata?.properties?.form_data?.assetName || asset.nftMetadata?.name || asset.params.name || '',
    
    // Campi modificabili
    description: ipfsMetadata?.properties?.form_data?.description || asset.nftMetadata?.description || asset.description || '',
    fileOrigin: ipfsMetadata?.properties?.form_data?.fileOrigin || '',
    type: ipfsMetadata?.properties?.form_data?.type || '',
    customType: ipfsMetadata?.properties?.form_data?.customType || '',
    
    // File - usa URL gateway per il preview
    image: ipfsMetadata?.image ? getImageUrl(ipfsMetadata.image) : (asset.nftMetadata?.image ? getImageUrl(asset.nftMetadata.image) : ''),
    imageFile: null as File | null,
    originalImage: ipfsMetadata?.image || asset.nftMetadata?.image || '', // Mantiene l'immagine originale IPFS
  });

  // Load current certification JSON when modal opens
  useEffect(() => {
    const loadCurrentCertJson = async () => {
      if (!isOpen || !asset.params?.reserve) return;
      
      setLoadingCurrentJson(true);
      try {
        // Convert reserve address to CID and fetch JSON
        const result = IPFSUrlService.getReserveAddressUrl(asset.params.reserve);
        if (!result.success || !result.gatewayUrl) {
          throw new Error('Errore nella conversione del reserve address');
        }

        // Fetch current JSON data
        const response = await fetch(result.gatewayUrl);
        if (!response.ok) {
          throw new Error('Errore nel fetch dei dati certificazione');
        }
        
        const jsonData = await response.json();
        setCurrentCertJson(jsonData);
        
        // Update form data with image from JSON (which now contains MINIO URL)
        if (jsonData.image) {
          setFormData(prev => ({
            ...prev,
            image: getImageUrl(jsonData.image),
            originalImage: jsonData.image
          }));
        }
        
      } catch (error) {
        console.error('❌ Error loading current certification JSON:', error);
        setSubmitError('Errore nel caricamento dei dati attuali della certificazione');
      } finally {
        setLoadingCurrentJson(false);
      }
    };

    loadCurrentCertJson();
  }, [isOpen, asset.params?.reserve]);

  // Opzioni per il tipo di certificazione
  const TYPE_OPTIONS = [
    { value: 'documento', label: 'Documento' },
    { value: 'immagine', label: 'Immagine' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'modello-3d', label: 'Modello 3D' },
    { value: 'codice', label: 'Codice' },
    { value: 'altro', label: 'Altro' }
  ];

  // Helper function per troncare gli indirizzi
  const truncateAddress = (address: string, startLength = 6, endLength = 4) => {
    if (!address) return '';
    if (address.length <= startLength + endLength) return address;
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  };

  // Aggiorna formData quando cambiano i metadati IPFS
  useEffect(() => {
    if (ipfsMetadata?.properties?.form_data) {
      setFormData(prev => ({
        ...prev,
        projectName: ipfsMetadata.properties?.form_data?.projectName || prev.projectName,
        assetName: ipfsMetadata.properties?.form_data?.assetName || prev.assetName,
        description: ipfsMetadata.properties?.form_data?.description || prev.description,
        fileOrigin: ipfsMetadata.properties?.form_data?.fileOrigin || prev.fileOrigin,
        type: ipfsMetadata.properties?.form_data?.type || prev.type,
        customType: ipfsMetadata.properties?.form_data?.customType || prev.customType,
        image: ipfsMetadata.image || prev.image,
      }));
    }
  }, [ipfsMetadata]);

  // Calculate versioning info on mount
  useEffect(() => {
    const versions = (asset.versioningInfo as Array<{version?: number; cid?: string; gatewayUrl?: string}>) || [];
    const latestVersion = versions.length > 0 
      ? Math.max(...versions.map(v => v.version || 0))
      : 0;
    
    const previousVersionData = versions.find(v => v.version === latestVersion);
    const currentCidInfo = asset.currentCidInfo as {cid?: string; gatewayUrl?: string} | undefined;
    
    setVersionInfo({
      nextVersion: latestVersion + 1,
      previousVersion: {
        version: latestVersion,
        cid: previousVersionData?.cid || currentCidInfo?.cid || '',
        ipfsLink: previousVersionData?.gatewayUrl || currentCidInfo?.gatewayUrl || ''
      }
    });
  }, [asset]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        image: imageUrl,
        imageFile: file
      }));
    }
  };

  const handleFileRemove = () => {
      setFormData(prev => ({
        ...prev,
      image: prev.originalImage ? getImageUrl(prev.originalImage) : '',
      imageFile: null
    }));
  };

  const handleRemoveExistingFile = (fileIndex: number) => {
    if (currentCertJson?.properties?.files_metadata?.[fileIndex]) {
      const fileToRemove = currentCertJson.properties.files_metadata[fileIndex];
      setFilesToRemove(prev => [...prev, fileToRemove.name]);
      
      // Update currentCertJson to immediately remove the file from display
      setCurrentCertJson((prev: any) => {
        if (!prev?.properties?.files_metadata) return prev;
        
        const updatedFiles = prev.properties.files_metadata.filter((_: any, index: number) => index !== fileIndex);
        
        return {
          ...prev,
          properties: {
            ...prev.properties,
            files_metadata: updatedFiles,
            // Update image if we removed the first file (primary image)
            ...(fileIndex === 0 && updatedFiles.length > 0 && {
              image: (updatedFiles[0] as any).s3StorageUrl || updatedFiles[0].gatewayUrl || updatedFiles[0].ipfsUrl
            })
          }
        };
      });
    }
  };


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach((file) => {
      const newAttachment: Attachment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };
      setAttachments(prev => [...prev, newAttachment]);
    });
    
    // Store actual File objects for IPFS upload
    setAttachmentFiles(prev => [...prev, ...fileArray]);
  };

  const removeAttachment = (id: string) => {
    const attachmentIndex = attachments.findIndex(att => att.id === id);
    setAttachments(prev => prev.filter(att => att.id !== id));
    // Also remove from file array
    if (attachmentIndex !== -1) {
      setAttachmentFiles(prev => prev.filter((_, index) => index !== attachmentIndex));
    }
  };



  const handleSave = async () => {
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      // Validation
      if (!formData.assetName.trim()) {
        throw new Error('Nome certificazione è obbligatorio');
      }
      if (!formData.description.trim()) {
        throw new Error('Descrizione è obbligatoria');
      }
      if (formData.description.length > 300) {
        throw new Error('Descrizione deve essere massimo 300 caratteri');
      }
      if (formData.fileOrigin.length > 100) {
        throw new Error('Origine del file deve essere massimo 100 caratteri');
      }
      if (formData.type === 'altro' && formData.customType.length > 50) {
        throw new Error('Tipo personalizzato deve essere massimo 50 caratteri');
      }

      // Verifica connessione Pera Wallet
      if (!isWalletConnected || !walletAddress) {
        throw new Error('Pera Wallet non connesso. Effettua il login prima di procedere.');
      }

      // Verifica che abbiamo il JSON attuale
      if (!currentCertJson) {
        throw new Error('Caricamento dati certificazione in corso. Riprova tra qualche secondo.');
      }

      // Collect all files to upload to MINIO
      const filesToUpload: File[] = [];
      
      // Add attachment files first (these will be additional files)
      filesToUpload.push(...attachmentFiles);
      
      // Add image file if present (this will become the primary image)
      if (formData.imageFile) {
        filesToUpload.unshift(formData.imageFile); // Add to beginning to make it primary
      }

      // Upload new files to MINIO before versioning
      if (filesToUpload.length > 0) {
        setIsUploadingToMinio(true);
        setMinioUploadError(null);
        try {
          await minioService.uploadCertificationToMinio(filesToUpload);
        } catch (error) {
          setMinioUploadError(error instanceof Error ? error.message : 'Errore durante il caricamento su MINIO');
          setIsUploadingToMinio(false);
          throw error;
        }
        setIsUploadingToMinio(false);
      }

      // Filter out files marked for removal
      const remainingFiles = currentCertJson.properties?.files_metadata?.filter((file: any) => 
        !filesToRemove.includes(file.name)
      ) || [];

      // Simply reuse the current JSON and add only the necessary changes
      const updatedJson = {
        ...currentCertJson, // Keep ALL existing data
        // Update only the fields that can be modified
        description: formData.description,
        properties: {
          ...currentCertJson.properties, // Keep ALL existing properties
          form_data: {
            ...currentCertJson.properties?.form_data, // Keep ALL existing form_data
            // Update only the fields that can be modified
            description: formData.description,
            fileOrigin: formData.fileOrigin,
            type: formData.type,
            customType: formData.customType,
            // Add versioning info
          version: versionInfo.nextVersion,
            previous_version_cid: asset.params.reserve ? 
              IPFSUrlService.getReserveAddressUrl(asset.params.reserve).cid : 
              null,
            previous_version_url: asset.params.reserve ? 
              IPFSUrlService.getReserveAddressUrl(asset.params.reserve).gatewayUrl : 
              null,
            // Update image info only if new file is uploaded
            ...(formData.imageFile && {
              fileName: formData.imageFile.name,
              fileSize: formData.imageFile.size,
              fileType: formData.imageFile.type,
              fileExtension: formData.imageFile.name.split('.').pop() || '',
              fileCreationDate: new Date().toISOString()
            }),
            timestamp: new Date().toISOString()
          },
          // Update files_metadata - remove marked files and add new ones
          files_metadata: [
            ...remainingFiles, // Keep remaining existing files
            // New files will be added by the IPFS service
          ]
        }
      };

      const result = await startVersioningFlow({
        assetId: asset.index,
          existingAssetId: asset.index,
          existingReserveAddress: asset.params.reserve,
          newCertificationData: updatedJson, // Use updated JSON as certification data
        newFiles: filesToUpload,
        formData: {
            projectName: formData.projectName,
            assetName: formData.assetName,
            unitName: currentCertJson.properties?.form_data?.unitName || asset.params.unitName || '',
            fullAssetName: currentCertJson.properties?.form_data?.fullAssetName || `${formData.projectName} / ${formData.assetName}`,
          description: formData.description,
            fileOrigin: formData.fileOrigin,
            type: formData.type,
            customType: formData.customType,
            version: versionInfo.nextVersion,
            imageFile: formData.imageFile // Pass the image file info
          },
          isOrganization: false, // This is a certification, not organization
          customJson: updatedJson // Pass the custom JSON for IPFS upload
      });

      if (result) {
      setSubmitSuccess(true);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Errore durante la creazione della versione');
    }
  };

  const handleVersioningSuccess = () => {
    setSubmitSuccess(true);
    // Non fare nulla - lascia che l'utente veda i risultati
  };

  const handleClose = () => {
    if (!isVersioningProcessing) {
    onClose();
    }
  };

  return (
    <Fragment>
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <Dialog.Title className="text-lg font-medium text-white">
              Modifica Certificazione - {asset.params.name || `Asset ${asset.index}`}
            </Dialog.Title>
            <button
              onClick={handleClose}
              disabled={false}
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Loading State */}
            {loadingCurrentJson && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-400">Caricamento dati certificazione...</p>
                </div>
              </div>
            )}

            {/* Content - only show when not loading */}
            {!loadingCurrentJson && (
              <>
            {/* Asset Basic Info */}
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-3">Informazioni Asset</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">ID Certificazione:</span>
                  <span className="ml-2 text-white font-mono">CERT-{asset.index}</span>
                </div>
                <div>
                  <span className="text-slate-400">Creatore:</span>
                  <span 
                    className="ml-2 text-white font-mono text-xs" 
                    title={asset.params.creator}
                  >
                    {truncateAddress(asset.params.creator)}
                  </span>
                </div>
                {ipfsMetadata?.properties?.form_data?.projectName && (
                  <div>
                    <span className="text-slate-400">Progetto:</span>
                    <span className="ml-2 text-white">{ipfsMetadata.properties.form_data.projectName}</span>
                  </div>
                )}
                {ipfsMetadata?.properties?.form_data?.type && (
                  <div>
                    <span className="text-slate-400">Tipo:</span>
                    <span className="ml-2 text-white">{ipfsMetadata.properties.form_data.type}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Version Information */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                <DocumentDuplicateIcon className="h-4 w-4" />
                Informazioni Versioning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Nuova Versione:</span>
                  <span className="ml-2 text-white font-semibold">v{versionInfo.nextVersion}</span>
                </div>
                <div>
                  <span className="text-slate-400">Versione Precedente:</span>
                  <span className="ml-2 text-white">v{versionInfo.previousVersion.version}</span>
                </div>
                {versionInfo.previousVersion.cid && (
                  <div className="md:col-span-2">
                    <span className="text-slate-400">CID Precedente:</span>
                    <div className="mt-1 p-2 bg-slate-700 rounded text-xs font-mono text-slate-300 break-all">
                      {versionInfo.previousVersion.cid}
                    </div>
                    {versionInfo.previousVersion.ipfsLink && (
                      <a 
                        href={versionInfo.previousVersion.ipfsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs mt-1 inline-block"
                      >
                        Visualizza versione precedente su IPFS →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* File Esistenti da IPFS */}
            {ipfsMetadata?.properties?.files_metadata && ipfsMetadata.properties.files_metadata.length > 0 && (
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                  <CloudArrowUpIcon className="h-4 w-4" />
                  File Attuali su IPFS
                </h3>
                <div className="space-y-2">
                  {ipfsMetadata.properties.files_metadata.map((file: {name: string; gatewayUrl: string}, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                          <DocumentDuplicateIcon className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{file.name}</p>
                          <p className="text-xs text-slate-400">Caricato su IPFS</p>
                        </div>
                      </div>
                      <a
                        href={file.gatewayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        Visualizza →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-4">
                
                {/* Nome Progetto e Nome Certificazione - Snelliti */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Nome Progetto
                    </label>
                    <div className="relative group">
                      <Input
                        value={formData.projectName}
                        placeholder="Nome del progetto"
                        disabled
                        className="bg-slate-600/50 border-slate-500 text-slate-300 cursor-not-allowed text-sm py-2 pr-8"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <div className="relative">
                          <InformationCircleIcon className="w-4 h-4 text-slate-500 hover:text-slate-400 cursor-help transition-colors" />
                          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                            Questa è una informazione Onchain non modificabile
                            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Nome Certificazione
                    </label>
                    <div className="relative group">
                      <Input
                        value={formData.assetName}
                        placeholder="Nome della certificazione"
                        disabled
                        className="bg-slate-600/50 border-slate-500 text-slate-300 cursor-not-allowed text-sm py-2 pr-8"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <div className="relative">
                          <InformationCircleIcon className="w-4 h-4 text-slate-500 hover:text-slate-400 cursor-help transition-colors" />
                          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                            Questa è una informazione Onchain non modificabile
                            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Origine File */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Origine del File <span className="text-slate-400">({formData.fileOrigin.length}/100 caratteri)</span>
                  </label>
                  <Input
                    value={formData.fileOrigin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('fileOrigin', e.target.value)}
                    placeholder="Es. Museo, Collezione privata, etc."
                    maxLength={100}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Massimo 100 caratteri
                  </p>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-4">

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Descrizione * <span className="text-slate-400">({formData.description.length}/300 caratteri)</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                    placeholder="Descrizione dettagliata della certificazione"
                    rows={4}
                    maxLength={300}
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Massimo 300 caratteri
                  </p>
                </div>

                {/* Tipo Certificazione */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tipo Certificazione *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('type', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleziona tipo</option>
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                      </div>

                {/* Tipo Personalizzato */}
                {formData.type === 'altro' && (
                      <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Specifica Tipo Personalizzato * <span className="text-slate-400">({formData.customType.length}/50 caratteri)</span>
                    </label>
                    <Input
                      value={formData.customType}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('customType', e.target.value)}
                      placeholder="Inserisci il tipo personalizzato"
                      maxLength={50}
                      required={formData.type === 'altro'}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Massimo 50 caratteri
                    </p>
                  </div>
                )}
                
                </div>
              </div>

          {/* File Management Section */}
          <div className="space-y-6">
            
            {/* File Certificazione - Immagine Principale */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                File Certificazione
                {currentCertJson?.properties?.files_metadata?.[0] && (
                  <span className="text-xs text-slate-400 ml-2">
                    (da JSON: {currentCertJson.properties.files_metadata[0].name})
                  </span>
                )}
              </label>
              <div 
                className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.image && getImageUrl(formData.image) ? (
                  <div className="space-y-3">
                    <img 
                      src={getImageUrl(formData.image) || undefined} 
                      alt="Preview" 
                      className="mx-auto h-20 w-20 object-cover rounded-lg"
                      onError={() => {
                        // Fallback se l'immagine non si carica
                        console.error('Errore nel caricamento dell\'immagine:', formData.image);
                      }}
                    />
                    <p className="text-sm text-slate-300">Clicca per cambiare file</p>
                    {formData.imageFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileRemove();
                        }}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded border border-red-400/30 hover:bg-red-400/10"
                      >
                        Rimuovi
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <CloudArrowUpIcon className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                    <p className="text-sm text-slate-300 mb-1">Clicca per caricare</p>
                    <p className="text-xs text-slate-400">PNG, JPG, PDF fino a 10MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => handleImageFileChange(e.target.files)}
                />
              </div>
            </div>

            {/* Allegati Esistenti e Nuovi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Allegati Esistenti */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Allegati Esistenti
                </label>
                {currentCertJson?.properties?.files_metadata && currentCertJson.properties.files_metadata.length > 1 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentCertJson.properties.files_metadata.slice(1).map((file: any, index: number) => {
                      const actualIndex = index + 1;
                      
                      return (
                        <FilePreviewDisplay
                          key={actualIndex}
                          file={{
                            name: file.name,
                            type: file.type || 'application/octet-stream',
                            size: file.size || 0,
                            url: file.gatewayUrl
                          }}
                          url={file.gatewayUrl}
                          onRemove={() => handleRemoveExistingFile(actualIndex)}
                          showDownload={false}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-700/30 rounded-lg border border-slate-600 text-center">
                    <DocumentDuplicateIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Nessun allegato esistente</p>
                  </div>
                )}
              </div>

              {/* Aggiungi Nuovi Allegati */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Aggiungi Nuovi Allegati
                </label>
                
                {/* Box Upload */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer mb-4 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => attachmentInputRef.current?.click()}
                >
                  <CloudArrowUpIcon className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                  <p className="text-sm text-slate-300 mb-1">Trascina file qui o clicca per selezionare</p>
                  <p className="text-xs text-slate-400">Documenti di supporto</p>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="*/*"
                    onChange={(e) => handleFiles(e.target.files || new FileList())}
                  />
                </div>

                {/* Lista Nuovi File */}
                {attachments.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Nuovi allegati da caricare:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {attachments.map((attachment) => (
                        <FilePreviewDisplay
                          key={attachment.id}
                          file={{
                            name: attachment.name,
                            type: attachment.type,
                            size: attachment.size,
                            url: attachment.url
                          }}
                          url={attachment.url}
                          onRemove={() => removeAttachment(attachment.id)}
                          showPreview={false}
                          showDownload={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* MINIO Upload State */}
            {isUploadingToMinio && (
              <Alert variant="info" title="Caricamento file su MINIO...">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span>Caricamento dei nuovi file su MINIO in corso...</span>
                </div>
              </Alert>
            )}

            {/* MINIO Upload Error */}
            {minioUploadError && (
              <Alert variant="error" title="Errore durante il caricamento su MINIO">
                {minioUploadError}
              </Alert>
            )}

            {/* Error State */}
            {submitError && (
              <Alert variant="error" title="Errore durante l'aggiornamento">
                {submitError}
              </Alert>
            )}

            {/* Success State */}
            {submitSuccess && versioningResult && (
              <Alert variant="success" title="🎉 Versione creata con successo!">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>🏷️ Asset ID:</strong> {asset.index}</p>
                      <p><strong>📝 Nuova Versione:</strong> v{versionInfo.nextVersion}</p>
                      <p><strong>🔗 Transaction ID:</strong> <span className="text-xs font-mono">{versioningResult?.txId}</span></p>
                    </div>
                    <div>
                      <p><strong>📊 Confirmed Round:</strong> {versioningResult?.confirmedRound}</p>
                      <p><strong>🔄 Stato:</strong> <span className="text-green-400">Aggiornato</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <p><strong>🎯 Nuovo Metadata CID:</strong></p>
                    <p className="text-xs font-mono break-all">{versioningResult?.newMetadataCid}</p>
                  </div>

                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                    <p><strong>📄 Nuovo Metadata IPFS URL:</strong></p>
                    <a href={versioningResult?.metadataUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm break-all">
                      {versioningResult?.metadataUrl}
                    </a>
                  </div>
                  
                  <div className="text-center pt-2">
                    <p className="text-sm text-green-400">✅ Versione creata e transazione firmata</p>
                    <p className="text-sm text-green-400">✅ File caricati su IPFS e nuovi metadati aggiornati</p>
                    <p className="text-sm text-green-400">✅ NFT aggiornato con nuovo reserve address</p>
                    <button
                      onClick={onClose}
                      className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Chiudi
                    </button>
                  </div>
                </div>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
            <button
                onClick={handleClose}
                disabled={isVersioningProcessing}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Annulla
            </button>
            <button
              onClick={handleSave}
                disabled={isVersioningProcessing || loadingCurrentJson || !currentCertJson || !formData.description.trim() || !formData.type.trim() || isUploadingToMinio}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isUploadingToMinio ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Caricamento su MINIO...
                  </>
                ) : isVersioningProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Creando v{versionInfo.nextVersion}...
                  </>
                ) : (
                  <>Crea Versione {versionInfo.nextVersion}</>
                )}
            </button>
            </div>
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>

        {/* Versioning Modal with Stepper */}
    <CertificationModal
      isOpen={isVersioningModalOpen}
      onClose={() => {
        closeVersioningModal();
        // Se il versioning è completato con successo, chiudi il modale parent e aggiorna la pagina
        if (versioningResult && !isVersioningProcessing) {
          onClose(); // Chiudi il ModifyAttachmentsModal
          // Chiama il callback di refresh SOLO ora che l'utente ha chiuso manualmente
          if (onAssetUpdated) {
            onAssetUpdated();
          }
        }
      }}
      title={`Creazione Versione ${versionInfo.nextVersion}`}
      steps={versioningSteps}
      onRetryStep={retryVersioningStep}
      isProcessing={isVersioningProcessing}
      result={versioningResult}
      onSuccess={handleVersioningSuccess}
    />
   </Fragment>
  );
};

export default ModifyAttachmentsModal; 