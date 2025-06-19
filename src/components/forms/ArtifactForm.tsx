import React, { useState } from 'react';
import { FormLayout, FormHeader, FileUpload, OrganizationData, LoadingSpinner, Alert } from '../ui';
import NFTMintingService, { type MintingResult } from '../../services/nftMintingService';

interface ArtifactFormProps {
  onBack: () => void;
}

type ArtifactType = 'artefatto-digitale' | 'video' | 'modello-3d' | 'altro';

interface ArtifactFormData {
  artifactType: ArtifactType;
  // Common fields
  uniqueId: string;
  title: string;
  description: string;
  author: string;
  creationDate: string;
  // NFT specific fields
  assetName: string;
  unitName: string;
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
  // Files
  files: File[];
}

export const ArtifactForm: React.FC<ArtifactFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<ArtifactFormData>({
    artifactType: 'artefatto-digitale',
    uniqueId: '',
    title: '',
    description: '',
    author: '',
    creationDate: '',
    assetName: '',
    unitName: '',
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
    director: '',
    duration: '',
    resolution: '',
    format: '',
    productionDate: '',
    productionTechnology: '',
    license: '',
    modelName: '',
    creator: '',
    software: '',
    fileFormat: '',
    polygonCount: '',
    dimensions: '',
    files: []
  });

  const [organizationData, setOrganizationData] = useState({
    name: 'Museo Arte',
    code: 'MA001',
    type: 'Museo',
    city: 'Roma'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<MintingResult | null>(null);

  const nftMintingService = new NFTMintingService();

  const handleInputChange = (field: keyof ArtifactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOrganizationUpdate = (newData: typeof organizationData) => {
    setOrganizationData(newData);
  };

  const handleFileUpload = (files: File[]) => {
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.uniqueId.trim()) errors.push('ID Unico è obbligatorio');
    if (!formData.title.trim()) errors.push('Titolo è obbligatorio');
    if (!formData.description.trim()) errors.push('Descrizione è obbligatoria');
    if (!formData.author.trim()) errors.push('Autore è obbligatorio');
    if (!formData.creationDate.trim()) errors.push('Data di creazione è obbligatoria');
    if (!formData.assetName.trim()) errors.push('Nome Asset NFT è obbligatorio');
    if (!formData.unitName.trim()) errors.push('Unit Name è obbligatorio');
    if (formData.unitName.length > 8) errors.push('Unit Name deve essere massimo 8 caratteri');
    if (formData.files.length === 0) errors.push('Almeno un file è obbligatorio');

    // Get mnemonic from environment
    const mnemonic = import.meta.env.VITE_PRIVATE_KEY_MNEMONIC;
    if (!mnemonic) errors.push('Mnemonic non configurata nel file .env');

    return { isValid: errors.length === 0, errors };
  };

  const prepareCertificationData = () => {
    // Get technical specs based on artifact type - convert all values to strings
    const getTechnicalSpecs = (): Record<string, string> => {
      switch (formData.artifactType) {
        case 'artefatto-digitale':
          return {
            originalReference: formData.originalReference || '',
            artifactTypology: formData.artifactTypology || '',
            technology: formData.technology || '',
            digitalDimensions: formData.digitalDimensions || '',
            functionality: formData.functionality || '',
            interactivity: formData.interactivity || '',
            metadata: formData.metadata || '',
            acquisitionMethod: formData.acquisitionMethod || '',
            digitalConservation: formData.digitalConservation || '',
            versioning: formData.versioning || ''
          };
        case 'video':
          return {
            director: formData.director || '',
            duration: formData.duration || '',
            resolution: formData.resolution || '',
            format: formData.format || '',
            productionDate: formData.productionDate || '',
            productionTechnology: formData.productionTechnology || '',
            license: formData.license || ''
          };
        case 'modello-3d':
          return {
            modelName: formData.modelName || '',
            creator: formData.creator || '',
            software: formData.software || '',
            fileFormat: formData.fileFormat || '',
            polygonCount: formData.polygonCount || '',
            dimensions: formData.dimensions || ''
          };
        default:
          return {};
      }
    };

    return {
      asset_type: formData.artifactType,
      unique_id: formData.uniqueId,
      title: formData.title,
      author: formData.author,
      creation_date: formData.creationDate,
      organization: {
        name: organizationData.name,
        code: organizationData.code,
        type: organizationData.type,
        city: organizationData.city
      },
      technical_specs: getTechnicalSpecs()
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      setSubmitError(`Errori di validazione: ${validation.errors.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting NFT certification process...');
      
      // Get mnemonic from environment
      const mnemonic = import.meta.env.VITE_PRIVATE_KEY_MNEMONIC;
      
      // Prepare certification data
      const certificationData = prepareCertificationData();
      
      console.log('Certification data:', certificationData);
      console.log('Files to upload:', formData.files.map(f => ({ name: f.name, size: f.size, type: f.type })));

      // Mint certification SBT with IPFS integration
      const result = await nftMintingService.mintCertificationSBT({
        mnemonic,
        certificationData,
        files: formData.files,
        assetName: formData.assetName,
        unitName: formData.unitName,
        formData: formData as any
      });

      console.log('NFT minting successful:', result);
      
      setMintResult(result);
      setSubmitSuccess(true);
      
      // Optional: Navigate to success page or reset form
      // onBack(); // Could navigate back or to a success page
      
    } catch (error) {
      console.error('Error during NFT certification:', error);
      setSubmitError(
        error instanceof Error 
          ? `Errore durante la certificazione: ${error.message}`
          : 'Errore sconosciuto durante la certificazione'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDigitalArtifactFields = () => (
    <>
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

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Tecnologia utilizzata (TEC)
        </label>
        <input
          type="text"
          placeholder="Tecnologia utilizzata"
          value={formData.technology}
          onChange={(e) => handleInputChange('technology', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Dimensioni digitali (DIM)
        </label>
        <input
          type="text"
          placeholder="es. 1920×1080"
          value={formData.digitalDimensions}
          onChange={(e) => handleInputChange('digitalDimensions', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Funzionalità d'uso (FUN)
        </label>
        <textarea
          placeholder="Descrivi funzionalità"
          value={formData.functionality}
          onChange={(e) => handleInputChange('functionality', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Interattività (INT)
        </label>
        <input
          type="text"
          placeholder="Livello interattività"
          value={formData.interactivity}
          onChange={(e) => handleInputChange('interactivity', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Metadati associati (MET)
        </label>
        <textarea
          placeholder="Metadati aggiuntivi"
          value={formData.metadata}
          onChange={(e) => handleInputChange('metadata', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Metodo di acquisizione (ACQ)
        </label>
        <input
          type="text"
          placeholder="Metodo acquisizione"
          value={formData.acquisitionMethod}
          onChange={(e) => handleInputChange('acquisitionMethod', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Conservazione digitale (CONS)
        </label>
        <input
          type="text"
          placeholder="Stato conservazione"
          value={formData.digitalConservation}
          onChange={(e) => handleInputChange('digitalConservation', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Versioning (VER)
        </label>
        <input
          type="text"
          placeholder="Versione corrente"
          value={formData.versioning}
          onChange={(e) => handleInputChange('versioning', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </>
  );

  const renderVideoFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Regista/Autore
        </label>
        <input
          type="text"
          placeholder="Nome regista o autore"
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

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Risoluzione
        </label>
        <input
          type="text"
          placeholder="es. 1920×1080"
          value={formData.resolution}
          onChange={(e) => handleInputChange('resolution', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Formato
        </label>
        <input
          type="text"
          placeholder="es. MP4, AVI"
          value={formData.format}
          onChange={(e) => handleInputChange('format', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Data di produzione
        </label>
        <input
          type="date"
          value={formData.productionDate}
          onChange={(e) => handleInputChange('productionDate', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Tecnologia utilizzata
        </label>
        <input
          type="text"
          placeholder="Tecnologia di ripresa"
          value={formData.productionTechnology}
          onChange={(e) => handleInputChange('productionTechnology', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Licenza d'uso
        </label>
        <input
          type="text"
          placeholder="Tipo di licenza"
          value={formData.license}
          onChange={(e) => handleInputChange('license', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </>
  );

  const render3DModelFields = () => (
    <>
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
          Creatore
        </label>
        <input
          type="text"
          placeholder="Nome del creatore"
          value={formData.creator}
          onChange={(e) => handleInputChange('creator', e.target.value)}
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

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Formato file
        </label>
        <input
          type="text"
          placeholder="es. OBJ, FBX"
          value={formData.fileFormat}
          onChange={(e) => handleInputChange('fileFormat', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Numero di poligoni
        </label>
        <input
          type="text"
          placeholder="Complessità del modello"
          value={formData.polygonCount}
          onChange={(e) => handleInputChange('polygonCount', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Dimensioni
        </label>
        <input
          type="text"
          placeholder="Dimensioni virtuali"
          value={formData.dimensions}
          onChange={(e) => handleInputChange('dimensions', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Licenza d'uso
        </label>
        <input
          type="text"
          placeholder="Tipo di licenza"
          value={formData.license}
          onChange={(e) => handleInputChange('license', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </>
  );

  const renderTypeSpecificFields = () => {
    switch (formData.artifactType) {
      case 'artefatto-digitale':
        return renderDigitalArtifactFields();
      case 'video':
        return renderVideoFields();
      case 'modello-3d':
        return render3DModelFields();
      case 'altro':
        return null; // Only file upload for "altro"
      default:
        return null;
    }
  };

  return (
    <FormLayout 
      title="Certifica Artefatto"
      sidebar={
        <OrganizationData 
          data={organizationData}
          onUpdate={handleOrganizationUpdate}
        />
      }
    >
      <FormHeader title="Certifica Artefatto" onBack={onBack} />

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Artifact Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tipologia
                  </label>
                  <select
                    value={formData.artifactType}
                    onChange={(e) => handleInputChange('artifactType', e.target.value as ArtifactType)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="artefatto-digitale">Artefatto digitale</option>
                    <option value="video">Video</option>
                    <option value="modello-3d">Modello 3D</option>
                    <option value="altro">Altro</option>
                  </select>
                </div>

                {/* Common Fields */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Identificativo univoco (ID)
                  </label>
                  <input
                    type="text"
                    placeholder="Inserisci ID univoco"
                    value={formData.uniqueId}
                    onChange={(e) => handleInputChange('uniqueId', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {formData.artifactType === 'video' ? 'Titolo' : formData.artifactType === 'modello-3d' ? 'Titolo (TIT)' : 'Titolo'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      formData.artifactType === 'video' ? 'Inserisci titolo del video' :
                      formData.artifactType === 'modello-3d' ? 'Inserisci titolo' :
                      'Inserisci titolo'
                    }
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Descrizione *
                  </label>
                  <textarea
                    placeholder="Inserisci una descrizione dettagliata dell'artefatto"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {formData.artifactType === 'artefatto-digitale' ? 'Autore / Creatore (AUT)' : 'Autore / Creatore'}
                  </label>
                  <input
                    type="text"
                    placeholder="Inserisci autore"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Data di creazione {formData.artifactType === 'artefatto-digitale' ? '(DATA)' : ''}
                  </label>
                  <input
                    type="date"
                    value={formData.creationDate}
                    onChange={(e) => handleInputChange('creationDate', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* NFT Specific Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Nome Asset NFT *
                    </label>
                    <input
                      type="text"
                      placeholder="es. SBT_CaputMundi_001"
                      value={formData.assetName}
                      onChange={(e) => handleInputChange('assetName', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Unit Name *
                    </label>
                    <input
                      type="text"
                      placeholder="es. CERT, SBT"
                      value={formData.unitName}
                      onChange={(e) => handleInputChange('unitName', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={8}
                      required
                    />
                    <p className="text-xs text-slate-400 mt-1">Max 8 caratteri</p>
                  </div>
                </div>

                {/* Type-specific Fields */}
                {renderTypeSpecificFields()}

                {/* File Upload */}
                <FileUpload
                  files={formData.files}
                  onFileUpload={handleFileUpload}
                      id="artifact-file-upload"
                    />

                {/* Loading State */}
                {isSubmitting && (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-3 text-white">Caricamento su IPFS e minting NFT in corso...</span>
                  </div>
                )}

                {/* Error State */}
                {submitError && (
                  <Alert variant="error" title="Errore durante la certificazione">
                    {submitError}
                  </Alert>
                )}

                {/* Success State */}
                {submitSuccess && mintResult && (
                  <Alert variant="success" title="🎉 Certificazione NFT completata con successo!">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><strong>🏷️ Asset ID:</strong> {mintResult.assetId}</p>
                          <p><strong>📝 Asset Name:</strong> {formData.assetName}</p>
                          <p><strong>🔤 Unit Name:</strong> {formData.unitName}</p>
                        </div>
                        <div>
                          <p><strong>🔗 Initial Mint TxID:</strong> <span className="text-xs font-mono">{mintResult.txId}</span></p>
                          {(mintResult as any).updateTxId && (
                            <p><strong>🔄 Update TxID:</strong> <span className="text-xs font-mono">{(mintResult as any).updateTxId}</span></p>
                          )}
                          <p><strong>📊 Confirmed Round:</strong> {mintResult.confirmedRound}</p>
                        </div>
                      </div>
                      
                      {(mintResult as any).finalReserveAddress && (
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                          <p><strong>🎯 Reserve Address (CID):</strong></p>
                          <p className="text-xs font-mono break-all">{(mintResult as any).finalReserveAddress}</p>
                        </div>
                      )}

                      {mintResult.metadataUrl && (
                        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                          <p><strong>📄 Metadata IPFS URL:</strong></p>
                          <a href={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${mintResult.ipfsHashes?.metadata}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm break-all">
                            {`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${mintResult.ipfsHashes?.metadata}`}
                          </a>
                        </div>
                      )}
                      
                      {mintResult.ipfsHashes && (
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
                      
                      <div className="text-center pt-2">
                        <p className="text-sm text-green-400">✅ Tutti i dati del form e i file sono stati caricati su IPFS con CID individuali</p>
                        <p className="text-sm text-green-400">✅ NFT mintato e aggiornato con reserve address derivato dal metadata CID</p>
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Certificando...</span>
                      </>
                    ) : (
                      'Certifica'
                    )}
                  </button>
                </div>
              </form>
    </FormLayout>
  );
}; 