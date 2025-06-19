import React from 'react';
import { Input, DateInput, FileUpload, Button, Alert, LoadingSpinner } from '../ui';

// Base interfaces
export interface BaseFormField {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  maxLength?: number;
}

export interface BaseFormData {
  uniqueId: string;
  name: string;
  description: string;
  author: string;
  date: string;
  files: File[];
  // Optional NFT fields (for creation forms)
  assetName?: string;
  unitName?: string;
}

export interface TypeOptionGroup {
  type: 'radio' | 'select';
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export interface BaseCertificationFormProps {
  // Data and handlers
  formData: BaseFormData;
  onInputChange: (field: string, value: string) => void;
  onFileUpload: (files: File[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;

  // Configuration
  formTitle: string;
  submitButtonText: string;
  submitButtonLoadingText: string;
  
  // Field configurations
  nameField: BaseFormField;
  authorField: BaseFormField;
  dateField: BaseFormField;
  typeField?: TypeOptionGroup;
  
  // Optional custom fields section
  customFields?: React.ReactNode;
  
  // NFT section (only for creation forms)
  showNFTSection?: boolean;
  nftAssetField?: BaseFormField;
  nftUnitField?: BaseFormField;
  
  // File upload configuration
  fileUploadLabel: string;
  fileUploadDescription: string;
  fileUploadId: string;
  
  // State
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  successContent?: React.ReactNode;
}

export const BaseCertificationForm: React.FC<BaseCertificationFormProps> = ({
  formData,
  onInputChange,
  onFileUpload,
  onSubmit,
  onBack,
  formTitle,
  submitButtonText,
  submitButtonLoadingText,
  nameField,
  authorField,
  dateField,
  typeField,
  customFields,
  showNFTSection = false,
  nftAssetField,
  nftUnitField,
  fileUploadLabel,
  fileUploadDescription,
  fileUploadId,
  isSubmitting,
  submitError,
  submitSuccess,
  successContent
}) => {
  if (submitSuccess && successContent) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">{formTitle}</h2>
        {successContent}
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">{formTitle}</h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        {/* 1. ID Unico */}
        <Input
          label="ID Unico *"
          placeholder="es. DOC-2024-001, ART-2024-001"
          value={formData.uniqueId}
          onChange={(e) => onInputChange('uniqueId', e.target.value)}
          required
        />

        {/* 2. Tipologia (se presente) */}
        {typeField && (
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              {typeField.label}
            </label>
            {typeField.type === 'radio' ? (
              <div className="space-y-3">
                {typeField.options.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name={`${fileUploadId}-type`}
                      value={option.value}
                      checked={typeField.value === option.value}
                      onChange={(e) => typeField.onChange(e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <select
                value={typeField.value}
                onChange={(e) => typeField.onChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {typeField.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* 3. Nome/Titolo */}
        <Input
          label={nameField.label}
          placeholder={nameField.placeholder}
          value={nameField.value}
          onChange={(e) => nameField.onChange(e.target.value)}
          required={nameField.required}
          helperText={nameField.helperText}
          maxLength={nameField.maxLength}
        />

        {/* 4. Descrizione */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Descrizione *
          </label>
          <textarea
            placeholder="Inserisci una descrizione dettagliata"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            required
          />
        </div>

        {/* 5. Autore/Creatore */}
        <Input
          label={authorField.label}
          placeholder={authorField.placeholder}
          value={authorField.value}
          onChange={(e) => authorField.onChange(e.target.value)}
          required={authorField.required}
          helperText={authorField.helperText}
          maxLength={authorField.maxLength}
        />

        {/* 6. Data */}
        <DateInput
          label={dateField.label}
          value={dateField.value}
          onChange={(e) => dateField.onChange(e.target.value)}
          required={dateField.required}
        />

        {/* 7. Campi specifici per tipo */}
        {customFields}

        {/* 8. Dati NFT (solo per form di creazione) */}
        {showNFTSection && nftAssetField && nftUnitField && (
          <div className="border-t border-slate-600 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">Dati NFT</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={nftAssetField.label}
                placeholder={nftAssetField.placeholder}
                value={nftAssetField.value}
                onChange={(e) => nftAssetField.onChange(e.target.value)}
                required={nftAssetField.required}
                helperText={nftAssetField.helperText}
                maxLength={nftAssetField.maxLength}
              />
              
              <Input
                label={nftUnitField.label}
                placeholder={nftUnitField.placeholder}
                value={nftUnitField.value}
                onChange={(e) => nftUnitField.onChange(e.target.value)}
                required={nftUnitField.required}
                helperText={nftUnitField.helperText}
                maxLength={nftUnitField.maxLength}
              />
            </div>
          </div>
        )}

        {/* 9. File Upload */}
        <FileUpload
          files={formData.files}
          onFileUpload={onFileUpload}
          label={fileUploadLabel}
          description={fileUploadDescription}
          id={fileUploadId}
        />

        {/* Loading State */}
        {isSubmitting && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-3 text-white">{submitButtonLoadingText}</span>
          </div>
        )}

        {/* Error State */}
        {submitError && (
          <Alert variant="error" title="Errore durante l'operazione">
            {submitError}
          </Alert>
        )}

        {/* 10. Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            onClick={onBack}
            variant="secondary"
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? submitButtonLoadingText : submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  );
}; 