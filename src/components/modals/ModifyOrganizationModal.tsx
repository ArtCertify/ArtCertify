import React, { useState, useRef, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CloudArrowUpIcon, BuildingOfficeIcon, EnvelopeIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { usePeraCertificationFlow } from '../../hooks/usePeraCertificationFlow';
import { Input, Textarea, Button, Alert } from '../ui';
import { CertificationModal } from './CertificationModal';
import { IPFSUrlService } from '../../services/ipfsUrlService';

interface ModifyOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationData: any;
  onOrganizationUpdated?: () => void;
}

const ORGANIZATION_TYPES = [
  { value: 'museo', label: 'Museo' },
  { value: 'galleria', label: 'Galleria d\'Arte' },
  { value: 'fondazione', label: 'Fondazione' },
  { value: 'associazione', label: 'Associazione' },
  { value: 'ente-pubblico', label: 'Ente Pubblico' },
  { value: 'privato', label: 'Collezionista Privato' },
  { value: 'altro', label: 'Altro' }
];

const ModifyOrganizationModal: React.FC<ModifyOrganizationModalProps> = ({
  isOpen,
  onClose,
  organizationData,
  onOrganizationUpdated
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
    isWalletConnected
  } = usePeraCertificationFlow();

  // Helper function to convert IPFS URL to gateway URL
  const getImageUrl = (ipfsUrl: string): string => {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return IPFSUrlService.getGatewayUrl(hash);
    }
    return ipfsUrl;
  };

  // Form state - inizializza con i dati esistenti
  const [formData, setFormData] = useState({
    name: organizationData?.name?.replace('ORG: ', '') || '',
    type: organizationData?.type || '',
    vatNumber: organizationData?.vatNumber || '',
    phone: organizationData?.phone || '',
    email: organizationData?.email || '',
    website: organizationData?.website || '',
    address: organizationData?.address || '',
    city: organizationData?.city || '',
    description: organizationData?.description || '',
    image: organizationData?.image ? getImageUrl(organizationData.image) : '',
    imageFile: null as File | null,
    originalImage: organizationData?.image || '', // Mantiene l'immagine originale IPFS
  });

  // Versioning info
  const [versionInfo] = useState({
    nextVersion: 1,
    previousVersion: {
      version: 0,
      cid: '',
      ipfsLink: ''
    }
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentOrgJson, setCurrentOrgJson] = useState<any>(null);
  const [loadingCurrentJson, setLoadingCurrentJson] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setFormData(prev => ({
      ...prev,
      imageFile: file,
      image: URL.createObjectURL(file)
    }));
  };

  // Handle file removal (revert to original)
  const handleFileRemove = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      image: prev.originalImage
    }));
  };

  // Load current organization JSON when modal opens
  useEffect(() => {
    const loadCurrentOrgJson = async () => {
      if (!isOpen || !organizationData?.reserveAddress) return;
      
      setLoadingCurrentJson(true);
      try {
        // Convert reserve address to CID and fetch JSON
        const result = IPFSUrlService.getReserveAddressUrl(organizationData.reserveAddress);
        if (!result.success || !result.gatewayUrl) {
          throw new Error('Errore nella conversione del reserve address');
        }

        // Fetch current JSON data
        const response = await fetch(result.gatewayUrl);
        if (!response.ok) {
          throw new Error('Errore nel fetch dei dati organizzazione');
        }
        
        const jsonData = await response.json();
        setCurrentOrgJson(jsonData);
        
      } catch (error) {
        // Error loading organization JSON
        setSubmitError('Errore nel caricamento dei dati attuali dell\'organizzazione');
      } finally {
        setLoadingCurrentJson(false);
      }
    };

    loadCurrentOrgJson();
  }, [isOpen, organizationData?.reserveAddress]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  // Handle save
  const handleSave = async () => {
    setSubmitError(null);

    if (!isWalletConnected) {
      setSubmitError('Wallet non connesso');
      return;
    }

    if (!currentOrgJson) {
      setSubmitError('Caricamento dati organizzazione in corso...');
      return;
    }

    try {
      // Prepare files to upload - solo se è stato caricato un nuovo file
      const filesToUpload: File[] = [];
      if (formData.imageFile) {
        filesToUpload.push(formData.imageFile);
      }

      // Use current JSON as base and update only changed fields
      const updatedJson = {
        ...currentOrgJson,
        name: `ORG: ${formData.name}`,
        description: formData.description,
        image: formData.imageFile ? `ipfs://[NEW_HASH]` : currentOrgJson.image, // Will be updated by IPFS service
        properties: {
          ...currentOrgJson.properties,
          form_data: {
            ...currentOrgJson.properties?.form_data,
            description: formData.description,
            customType: formData.type,
            vatNumber: formData.vatNumber,
            phone: formData.phone,
            email: formData.email,
            website: formData.website,
            address: formData.address,
            fileOrigin: formData.city,
            // Update file info only if new file is uploaded
            ...(formData.imageFile ? {
              fileName: formData.imageFile.name,
              fileSize: formData.imageFile.size,
              fileType: formData.imageFile.type,
              fileExtension: formData.imageFile.name.split('.').pop(),
              fileCreationDate: new Date().toISOString()
            } : {}),
            timestamp: new Date().toISOString()
          }
        }
      };

      // Prepare form data for the flow
      const formDataForFlow = {
        ...formData,
        projectName: 'Organizzazione',
        assetName: `ORG: ${formData.name}`,
        unitName: `ORG${formData.name.substring(0, 4).toUpperCase()}`,
        type: 'organizzazione',
        customType: formData.type,
        timestamp: new Date().toISOString(),
        fileCreationDate: formData.imageFile ? new Date().toISOString() : currentOrgJson.properties?.form_data?.fileCreationDate,
        fileExtension: formData.imageFile?.name.split('.').pop() || currentOrgJson.properties?.form_data?.fileExtension || 'png',
        fileName: formData.imageFile?.name || currentOrgJson.properties?.form_data?.fileName || 'organization.png',
        fileOrigin: formData.city || 'Unknown',
        fileSize: formData.imageFile?.size || currentOrgJson.properties?.form_data?.fileSize || 0,
        fileType: formData.imageFile?.type || currentOrgJson.properties?.form_data?.fileType || 'image/png',
        // Se non c'è un nuovo file, mantieni i dati originali
        originalImage: formData.originalImage,
        fullAssetName: `ORG: ${formData.name}`,
        website: formData.website,
        address: formData.address
      };

      // Prepare certification data for versioning
      const newCertificationData = {
        asset_type: 'organization',
        unique_id: `ORG_${formData.name}`,
        title: `ORG: ${formData.name}`,
        author: 'Organization',
        creation_date: organizationData?.rawData?.properties?.form_data?.timestamp || new Date().toISOString(),
        organization: {
          name: formData.name,
          code: `ORG${formData.name.substring(0, 4).toUpperCase()}`,
          type: formData.type,
          city: formData.city
        },
        technical_specs: {
          description: formData.description,
          version: versionInfo.nextVersion,
          previous_version: versionInfo.previousVersion.version,
          modification_date: new Date().toISOString(),
          files_count: filesToUpload.length,
          contact_info: {
            email: formData.email,
            phone: formData.phone,
            website: formData.website,
            address: formData.address
          },
          legal_info: {
            vatNumber: formData.vatNumber,
            type: formData.type,
            city: formData.city
          }
        }
      };

      // Start versioning flow
      await startVersioningFlow({
        existingAssetId: organizationData?.assetId,
        existingReserveAddress: organizationData?.reserveAddress,
        newCertificationData: newCertificationData,
        newFiles: filesToUpload,
        formData: formDataForFlow,
        certificationData: newCertificationData,
        files: filesToUpload,
        assetName: `ORG: ${formData.name}`,
        unitName: `ORG${formData.name.substring(0, 4).toUpperCase()}`,
        isOrganization: true,
        customJson: updatedJson
      });

    } catch (error) {
      // Error modifying organization
      setSubmitError(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  };

  // Handle versioning success
  const handleVersioningSuccess = () => {
    if (onOrganizationUpdated) {
      onOrganizationUpdated();
    }
  };

  return (
    <Fragment>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
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
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 text-left align-middle shadow-xl transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <BuildingOfficeIcon className="w-6 h-6 text-blue-400" />
                      <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                        Modifica Organizzazione
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {loadingCurrentJson ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                          <p className="text-slate-400">Caricamento dati organizzazione...</p>
                        </div>
                      </div>
                    ) : (
                    <div className="space-y-8">
                      {/* Organization Image */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                          Logo Organizzazione
                        </label>
                        <div
                          className="relative border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors cursor-pointer"
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {formData.image && (formData.image.startsWith('ipfs://') ? getImageUrl(formData.image) : formData.image) ? (
                            <div className="space-y-4">
                              <img
                                src={formData.image.startsWith('ipfs://') ? (getImageUrl(formData.image) || undefined) : (formData.image || undefined)}
                                alt="Organization logo"
                                className="mx-auto h-32 w-32 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div className="flex gap-2 justify-center">
                                <p className="text-sm text-slate-400">
                                  Clicca per cambiare immagine
                                </p>
                                {formData.imageFile && (
                                  <button
                                    type="button"
                                    onClick={handleFileRemove}
                                    className="text-xs text-red-400 hover:text-red-300"
                                  >
                                    Rimuovi
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-slate-400" />
                              <div>
                                <p className="text-sm text-slate-300">
                                  Trascina qui l'immagine o{' '}
                                  <span className="text-blue-400 hover:text-blue-300">
                                    clicca per selezionare
                                  </span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  PNG, JPG, GIF fino a 10MB
                                </p>
                              </div>
                            </div>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Organization Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Nome Organizzazione
                          </label>
                          <Input
                            value={formData.name}
                            disabled
                            placeholder="Nome dell'organizzazione"
                            className="bg-slate-600 text-slate-400 cursor-not-allowed"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Il nome dell'organizzazione non può essere modificato
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Tipo Organizzazione *
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">Seleziona tipo</option>
                            {ORGANIZATION_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Descrizione
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Descrizione dell'organizzazione"
                          rows={4}
                        />
                      </div>

                      {/* Contact Information */}
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                          <EnvelopeIcon className="w-5 h-5" />
                          Informazioni di Contatto
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Email
                            </label>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="email@organizzazione.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Telefono
                            </label>
                            <Input
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+39 123 456 7890"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Sito Web
                            </label>
                            <Input
                              value={formData.website}
                              onChange={(e) => handleInputChange('website', e.target.value)}
                              placeholder="www.organizzazione.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Indirizzo
                            </label>
                            <Input
                              value={formData.address}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              placeholder="Via, Città, CAP"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Legal Information */}
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                          <IdentificationIcon className="w-5 h-5" />
                          Informazioni Legali
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Partita IVA
                            </label>
                            <Input
                              value={formData.vatNumber}
                              onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                              placeholder="IT12345678901"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Città
                            </label>
                            <Input
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="Città"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Error Alert */}
                      {submitError && (
                        <Alert
                          variant="error"
                          title="Errore"
                          dismissible
                          onDismiss={() => setSubmitError(null)}
                        >
                          {submitError}
                        </Alert>
                      )}
                    </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
                    <Button
                      variant="secondary"
                      onClick={onClose}
                      disabled={isVersioningProcessing}
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isVersioningProcessing || !formData.type.trim() || loadingCurrentJson || !currentOrgJson}
                      loading={isVersioningProcessing}
                    >
                      {isVersioningProcessing ? 'Modificando...' : 'Salva Modifiche'}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Versioning Modal with Stepper */}
      <CertificationModal
        isOpen={isVersioningModalOpen}
        onClose={() => {
          closeVersioningModal();
          if (versioningResult && !isVersioningProcessing) {
            onClose();
            if (onOrganizationUpdated) {
              onOrganizationUpdated();
            }
          }
        }}
        title="Modifica Organizzazione"
        steps={versioningSteps}
        onRetryStep={retryVersioningStep}
        isProcessing={isVersioningProcessing}
        result={versioningResult}
        onSuccess={handleVersioningSuccess}
      />
    </Fragment>
  );
};

export default ModifyOrganizationModal;
