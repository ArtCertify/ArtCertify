import React, { useState } from 'react';
import { BaseCertificationForm, type BaseFormData, type BaseFormField, type TypeOptionGroup } from './BaseCertificationForm';
import { FormLayout, Button } from '../ui';
import { OrganizationData } from '../ui';
import NFTMintingService, { type MintingResult } from '../../services/nftMintingService';

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
  // Organization data state
  const [organizationData, setOrganizationData] = useState({
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

  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [mintResult, setMintResult] = useState<MintingResult | null>(null);

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

  const handleOrganizationUpdate = (newData: typeof organizationData) => {
    setOrganizationData(newData);
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
    if (!formData.unitName?.trim()) errors.push('Unit Name è obbligatorio');
    if ((formData.unitName?.length || 0) > 8) errors.push('Unit Name deve essere massimo 8 caratteri');
    if (formData.files.length === 0) errors.push('Almeno un file è obbligatorio');

    const mnemonic = import.meta.env.VITE_PRIVATE_KEY_MNEMONIC;
    if (!mnemonic) errors.push('Mnemonic non configurata nel file .env');

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      setSubmitError(validation.errors.join(', '));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const nftMintingService = new NFTMintingService();
      const certificationData = prepareCertificationData();
      const mnemonic = import.meta.env.VITE_PRIVATE_KEY_MNEMONIC;
      
      const result = await nftMintingService.mintCertificationSBT({
        mnemonic,
        certificationData,
        files: formData.files,
        assetName: formData.assetName!,
        unitName: formData.unitName!,
        formData: formData as any
      });

      setMintResult(result);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Errore durante la certificazione');
    } finally {
      setIsSubmitting(false);
    }
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
    required: true
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

  // Success content
  const successContent = (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold text-green-400 mb-4">
        🎉 Certificazione NFT completata con successo!
      </h3>
      
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>🏷️ Asset ID:</strong> {mintResult?.assetId}</p>
            <p><strong>📝 Asset Name:</strong> {formData.assetName}</p>
            <p><strong>🔤 Unit Name:</strong> {formData.unitName}</p>
          </div>
          <div>
            <p><strong>🔗 Initial Mint TxID:</strong> <span className="text-xs font-mono">{mintResult?.txId}</span></p>
            <p><strong>📊 Confirmed Round:</strong> {mintResult?.confirmedRound}</p>
          </div>
        </div>
        
        {mintResult?.metadataUrl && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
            <p><strong>📄 Metadata IPFS URL:</strong></p>
            <a href={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${mintResult?.ipfsHashes?.metadata}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm break-all">
              {`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${mintResult?.ipfsHashes?.metadata}`}
            </a>
          </div>
        )}
        
        {mintResult?.ipfsHashes && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
            <p><strong>📁 File IPFS Hashes:</strong></p>
            <div className="text-sm space-y-1">
              <p>Metadata JSON: <span className="font-mono">{mintResult.ipfsHashes.metadata}</span></p>
              {mintResult.ipfsHashes.files.map((file, index) => (
                <p key={index}>📎 {file.name}: <span className="font-mono text-xs">{file.hash}</span></p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <Button onClick={onBack} variant="secondary">
          Torna alla Dashboard
        </Button>
        <Button 
          onClick={() => window.open(`/asset/${mintResult?.assetId}`, '_blank')}
          variant="primary"
        >
          Visualizza Certificazione
        </Button>
      </div>
    </div>
  );

  return (
    <FormLayout 
      title="Certificazione Artefatto"
      sidebar={
        <OrganizationData 
          data={organizationData}
          onUpdate={handleOrganizationUpdate}
        />
      }
    >
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
        isSubmitting={isSubmitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
        successContent={successContent}
      />
    </FormLayout>
  );
}; 