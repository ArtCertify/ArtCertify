import React, { useState } from 'react';
import { BaseCertificationForm, type BaseFormData, type BaseFormField, type TypeOptionGroup } from './BaseCertificationForm';
import { FormLayout } from '../ui';
import { CertificationModal } from '../modals/CertificationModal';
import { usePeraCertificationFlow } from '../../hooks/usePeraCertificationFlow';

interface ArtifactFormProps {
  onBack: () => void;
}

type ArtifactType = 'artefatto-digitale' | 'video' | 'modello-3d' | 'altro';

interface ArtifactFormData extends BaseFormData {
  artifactType: ArtifactType;
  title: string;
  creationDate: string;
  // Digital artifact specific
  originalReference: string;
  artifactTypology: string;
  technology: string;
  digitalDimensions: string;
  functionality: string;
  interactivity: string;
  metadata: string;
  acquisitionMethod: string;
  digitalConservation: string;
  versioning: string;
  // Video specific
  director: string;
  duration: string;
  resolution: string;
  format: string;
  productionDate: string;
  productionTechnology: string;
  license: string;
  // 3D Model specific
  modelName: string;
  creator: string;
  software: string;
  fileFormat: string;
  polygonCount: string;
  dimensions: string;
}

export const ArtifactForm: React.FC<ArtifactFormProps> = ({ onBack }) => {
  // Certification flow hook
  const {
    isModalOpen,
    isProcessing,
    result: mintResult,
    steps,
    startCertificationFlow,
    retryStep,
    closeModal,
    isWalletConnected,
    walletAddress
  } = usePeraCertificationFlow();

  // Organization data state
  const [organizationData] = useState({
    name: 'Museo Arte',
    code: 'MA001',
    type: 'Museo',
    city: 'Roma'
  });

  // Form data state
  const [formData, setFormData] = useState<ArtifactFormData>({
    artifactType: 'artefatto-digitale',
    uniqueId: '',
    name: '', // Will be mapped to title
    title: '',
    description: '',
    author: '',
    date: '', // Will be mapped to creationDate
    creationDate: '',
    assetName: '',
    unitName: '',
    files: [],
    // Digital artifact specific
    originalReference: '',
    artifactTypology: '',
    technology: '',
    digitalDimensions: '',
    functionality: '',
    interactivity: '',
    metadata: '',
    acquisitionMethod: '',
    digitalConservation: '',
    versioning: '',
    // Video specific
    director: '',
    duration: '',
    resolution: '',
    format: '',
    productionDate: '',
    productionTechnology: '',
    license: '',
    // 3D Model specific
    modelName: '',
    creator: '',
    software: '',
    fileFormat: '',
    polygonCount: '',
    dimensions: ''
  });

  // State management for form validation
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Keep mappings in sync
      if (field === 'title') updated.name = value;
      if (field === 'name') updated.title = value;
      if (field === 'creationDate') updated.date = value;
      if (field === 'date') updated.creationDate = value;
      return updated;
    });
  };


  const handleFileUpload = (files: File[]) => {
    setFormData(prev => ({ ...prev, files }));
  };

  const prepareCertificationData = () => {
    const getTechnicalSpecs = (): Record<string, string> => {
      const baseSpecs = {
        artifactType: formData.artifactType,
      };

      switch (formData.artifactType) {
        case 'artefatto-digitale':
          return {
            ...baseSpecs,
            originalReference: formData.originalReference,
            artifactTypology: formData.artifactTypology,
            technology: formData.technology,
            digitalDimensions: formData.digitalDimensions,
            functionality: formData.functionality,
            interactivity: formData.interactivity,
            metadata: formData.metadata,
            acquisitionMethod: formData.acquisitionMethod,
            digitalConservation: formData.digitalConservation,
            versioning: formData.versioning
          };
        case 'video':
          return {
            ...baseSpecs,
            director: formData.director,
            duration: formData.duration,
            resolution: formData.resolution,
            format: formData.format,
            productionDate: formData.productionDate,
            productionTechnology: formData.productionTechnology,
            license: formData.license
          };
        case 'modello-3d':
          return {
            ...baseSpecs,
            modelName: formData.modelName,
            creator: formData.creator,
            software: formData.software,
            fileFormat: formData.fileFormat,
            polygonCount: formData.polygonCount,
            dimensions: formData.dimensions
          };
        default:
          return baseSpecs;
      }
    };

    return {
      asset_type: formData.artifactType,
      unique_id: formData.uniqueId,
      title: formData.title,
      author: formData.author,
      creation_date: formData.creationDate,
      organization: organizationData,
      technical_specs: {
        description: formData.description,
        ...getTechnicalSpecs()
      }
    };
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!formData.uniqueId.trim()) errors.push('ID Unico è obbligatorio');
    if (!formData.title.trim()) errors.push('Titolo è obbligatorio');
    if (!formData.description.trim()) errors.push('Descrizione è obbligatoria');
    if (!formData.author.trim()) errors.push('Autore è obbligatorio');
    if (!formData.creationDate.trim()) errors.push('Data di creazione è obbligatoria');
    if (!formData.assetName?.trim()) errors.push('Nome Asset è obbligatorio');
    if ((formData.assetName?.length || 0) > 32) errors.push('Nome Asset deve essere massimo 32 caratteri');
    if (!formData.unitName?.trim()) errors.push('Unit Name è obbligatorio');
    if ((formData.unitName?.length || 0) > 8) errors.push('Unit Name deve essere massimo 8 caratteri');
    if (formData.files.length === 0) errors.push('Almeno un file è obbligatorio');

    // Verifica connessione Pera Wallet invece della mnemonic
    if (!isWalletConnected || !walletAddress) {
      errors.push('Pera Wallet non connesso. Effettua il login prima di procedere.');
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
      setSubmitError(validation.errors.join(', '));
      return;
    }

    setSubmitError(null);

    try {
      const certificationData = prepareCertificationData();
      
      await startCertificationFlow({
        certificationData,
        files: formData.files,
        assetName: formData.assetName!,
        unitName: formData.unitName!,
        formData: formData
      });

      // Il successo viene gestito tramite il modal
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Errore durante la certificazione');
    }
  };

  const handleCertificationSuccess = () => {
    setSubmitSuccess(true);
    onBack(); // Redirect back to dashboard or wherever appropriate
  };

  // Field configurations
  const nameField: BaseFormField = {
    value: formData.title,
    onChange: (value) => handleInputChange('title', value),
    label: formData.artifactType === 'video' ? 'Titolo *' : 
           formData.artifactType === 'modello-3d' ? 'Titolo (TIT) *' : 'Titolo *',
    placeholder: formData.artifactType === 'video' ? 'Inserisci titolo del video' :
                 formData.artifactType === 'modello-3d' ? 'Inserisci titolo' :
                 'Inserisci titolo',
    required: true
  };

  const authorField: BaseFormField = {
    value: formData.author,
    onChange: (value) => handleInputChange('author', value),
    label: formData.artifactType === 'artefatto-digitale' ? 'Autore / Creatore (AUT) *' : 'Autore / Creatore *',
    placeholder: 'Inserisci autore',
    required: true
  };

  const dateField: BaseFormField = {
    value: formData.creationDate,
    onChange: (value) => handleInputChange('creationDate', value),
    label: `Data di creazione ${formData.artifactType === 'artefatto-digitale' ? '(DATA)' : ''} *`,
    required: true
  };

  const typeField: TypeOptionGroup = {
    type: 'select',
    label: 'Tipologia *',
    options: [
      { value: 'artefatto-digitale', label: 'Artefatto digitale' },
      { value: 'video', label: 'Video' },
      { value: 'modello-3d', label: 'Modello 3D' },
      { value: 'altro', label: 'Altro' }
    ],
    value: formData.artifactType,
    onChange: (value) => handleInputChange('artifactType', value)
  };

  const nftAssetField: BaseFormField = {
    value: formData.assetName || '',
    onChange: (value) => handleInputChange('assetName', value),
    label: 'Nome Asset *',
    placeholder: 'es. SBT_CaputMundi_001',
    required: true,
    maxLength: 32,
    helperText: 'Max 32 caratteri (limite Algorand)'
  };

  const nftUnitField: BaseFormField = {
    value: formData.unitName || '',
    onChange: (value) => handleInputChange('unitName', value),
    label: 'Unit Name *',
    placeholder: 'es. CERT, SBT',
    required: true,
    maxLength: 8,
    helperText: 'Max 8 caratteri'
  };

  // Custom fields based on artifact type
  const renderTypeSpecificFields = (): React.ReactNode => {
    switch (formData.artifactType) {
      case 'artefatto-digitale':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Opera originale di riferimento (OOR)
        </label>
        <input
          type="text"
          placeholder="Riferimento opera originale"
          value={formData.originalReference}
          onChange={(e) => handleInputChange('originalReference', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Tipologia (TYP)
        </label>
        <input
          type="text"
          placeholder="Tipologia artefatto"
          value={formData.artifactTypology}
          onChange={(e) => handleInputChange('artifactTypology', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      </div>
      </div>
  );
      case 'video':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Regista/Autore
        </label>
        <input
          type="text"
                  placeholder="Nome regista"
          value={formData.director}
          onChange={(e) => handleInputChange('director', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Durata
        </label>
        <input
          type="text"
          placeholder="Durata in minuti"
          value={formData.duration}
          onChange={(e) => handleInputChange('duration', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      </div>
      </div>
  );
      case 'modello-3d':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Nome modello
        </label>
        <input
          type="text"
          placeholder="Nome del modello 3D"
          value={formData.modelName}
          onChange={(e) => handleInputChange('modelName', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Software utilizzato
        </label>
        <input
          type="text"
          placeholder="es. Blender, Maya"
          value={formData.software}
          onChange={(e) => handleInputChange('software', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      </div>
      </div>
        );
      default:
        return null;
    }
  };

  // Success content - removed as requested

  return (
    <>
    <FormLayout>
        <BaseCertificationForm
          formData={formData}
          onInputChange={handleInputChange}
                  onFileUpload={handleFileUpload}
          onSubmit={handleSubmit}
          onBack={onBack}
          formTitle="Certificazione Artefatto"
          submitButtonText="Certifica Artefatto"
          submitButtonLoadingText="Certificando..."
          nameField={nameField}
          authorField={authorField}
          dateField={dateField}
          typeField={typeField}
          customFields={renderTypeSpecificFields()}
          showNFTSection={true}
          nftAssetField={nftAssetField}
          nftUnitField={nftUnitField}
          fileUploadLabel="Carica File *"
          fileUploadDescription="Trascina qui i file dell'artefatto o clicca per selezionare"
          fileUploadId="artifact-file-upload"
          isSubmitting={isProcessing}
          submitError={submitError}
          submitSuccess={submitSuccess}
        />
      </FormLayout>

      {/* Certification Modal with Stepper */}
      <CertificationModal
        title="Certificazione Artefatto"
        isOpen={isModalOpen}
        onClose={closeModal}
        steps={steps}
        onRetryStep={retryStep}
        isProcessing={isProcessing}
        result={mintResult}
        onSuccess={handleCertificationSuccess}
      />
    </>
  );
}; 