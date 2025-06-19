import React, { useState } from 'react';
import { BaseCertificationForm, type BaseFormData, type BaseFormField, type TypeOptionGroup } from './BaseCertificationForm';
import { Button, FormLayout } from '../ui';
import { OrganizationData } from '../ui';
import NFTMintingService, { type MintingResult } from '../../services/nftMintingService';

interface DocumentCertificationFormProps {
  onBack: () => void;
}

interface DocumentFormData extends BaseFormData {
  documentName: string;
  authorName: string;
  documentType: 'tipologia' | 'altro';
  customType: string;
}

export const DocumentForm: React.FC<DocumentCertificationFormProps> = ({ onBack }) => {
  // Organization data state
  const [organizationData, setOrganizationData] = useState({
    name: 'Museo Arte',
    code: 'MA001',
    type: 'Museo',
    city: 'Roma'
  });

  // Form data state
  const [formData, setFormData] = useState<DocumentFormData>({
    uniqueId: '',
    name: '', // Will be mapped to documentName
    documentName: '',
    description: '',
    author: '', // Will be mapped to authorName
    authorName: '',
    date: '',
    documentType: 'tipologia',
    customType: '',
    assetName: '',
    unitName: '',
    files: []
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
      if (field === 'documentName') updated.name = value;
      if (field === 'name') updated.documentName = value;
      if (field === 'authorName') updated.author = value;
      if (field === 'author') updated.authorName = value;
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
    return {
      asset_type: "document",
      unique_id: formData.uniqueId,
      title: formData.documentName,
      author: formData.authorName,
      creation_date: formData.date,
      organization: organizationData,
      technical_specs: {
        description: formData.description,
        document_type: formData.documentType === 'altro' ? formData.customType : formData.documentType
      }
    };
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.uniqueId.trim()) errors.push('ID Unico è obbligatorio');
    if (!formData.documentName.trim()) errors.push('Nome Documento è obbligatorio');
    if (!formData.description.trim()) errors.push('Descrizione è obbligatoria');
    if (!formData.authorName.trim()) errors.push('Nome Autore è obbligatorio');
    if (!formData.date.trim()) errors.push('Data è obbligatoria');
    if (!formData.assetName?.trim()) errors.push('Nome Asset è obbligatorio');
    if (!formData.unitName?.trim()) errors.push('Unit Name è obbligatorio');
    if ((formData.unitName?.length || 0) > 8) errors.push('Unit Name deve essere massimo 8 caratteri');
    if (formData.files.length === 0) errors.push('Almeno un file è obbligatorio');
    if (formData.documentType === 'altro' && !formData.customType.trim()) {
      errors.push('Specifica il tipo personalizzato');
    }

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
        formData: {
          ...formData,
          artifactType: 'document' as any,
          title: formData.documentName,
          author: formData.authorName,
          creationDate: formData.date
        } as any
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
    value: formData.documentName,
    onChange: (value) => handleInputChange('documentName', value),
    label: 'Nome Documento *',
    placeholder: 'Inserisci il nome del documento',
    required: true
  };

  const authorField: BaseFormField = {
    value: formData.authorName,
    onChange: (value) => handleInputChange('authorName', value),
    label: 'Nome Autore *',
    placeholder: 'Inserisci il nome dell\'autore',
    required: true
  };

  const dateField: BaseFormField = {
    value: formData.date,
    onChange: (value) => handleInputChange('date', value),
    label: 'Data *',
    required: true
  };

  const typeField: TypeOptionGroup = {
    type: 'radio',
    label: 'Tipologia',
    options: [
      { value: 'tipologia', label: 'Tipologia' },
      { value: 'altro', label: 'Altro' }
    ],
    value: formData.documentType,
    onChange: (value) => handleInputChange('documentType', value)
  };

  const nftAssetField: BaseFormField = {
    value: formData.assetName || '',
    onChange: (value) => handleInputChange('assetName', value),
    label: 'Nome Asset *',
    placeholder: 'es. DOC_Contratto_001',
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

  // Custom fields for document type
  const customFields = (
    <>
      {formData.documentType === 'altro' && (
        <div className="mt-3">
          <input
            type="text"
            placeholder="Specifica altro"
            value={formData.customType}
            onChange={(e) => handleInputChange('customType', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </>
  );

  // Success content
  const successContent = (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold text-green-400 mb-4">
        ✅ Certificazione Documento Completata!
      </h3>
      
      <div className="space-y-3">
        <div className="bg-gray-900/20 border border-gray-500/30 rounded-lg p-3">
          <p><strong>🎯 Asset ID:</strong> {mintResult?.assetId}</p>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <p><strong>📄 Metadata IPFS URL:</strong></p>
          <a href={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${mintResult?.ipfsHashes?.metadata}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm break-all">
            {`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${mintResult?.ipfsHashes?.metadata}`}
          </a>
        </div>
        
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
      title="Certificazione Documento"
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
        formTitle="Certificazione Documento"
        submitButtonText="Certifica Documento"
        submitButtonLoadingText="Certificando..."
        nameField={nameField}
        authorField={authorField}
        dateField={dateField}
        typeField={typeField}
        customFields={customFields}
        showNFTSection={true}
        nftAssetField={nftAssetField}
        nftUnitField={nftUnitField}
        fileUploadLabel="Carica File *"
        fileUploadDescription="Trascina qui i file del documento o clicca per selezionare"
        fileUploadId="document-file-upload"
        isSubmitting={isSubmitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
        successContent={successContent}
      />
    </FormLayout>
  );
}; 