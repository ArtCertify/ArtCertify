import React, { useState } from 'react';
import { FormLayout, FormHeader, FileUpload, OrganizationData, Input, Button } from '../ui';

interface DocumentCertificationFormProps {
  onBack: () => void;
}

interface DocumentFormData {
  documentName: string;
  authorName: string;
  date: string;
  documentType: 'tipologia' | 'altro';
  customType: string;
  files: File[];
}

export const DocumentForm: React.FC<DocumentCertificationFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<DocumentFormData>({
    documentName: '',
    authorName: '',
    date: '',
    documentType: 'tipologia',
    customType: '',
    files: []
  });

  const [organizationData, setOrganizationData] = useState({
    name: 'Museo Arte',
    code: 'MA001',
    type: 'Museo',
    city: 'Roma'
  });

  const handleInputChange = (field: keyof DocumentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOrganizationUpdate = (newData: typeof organizationData) => {
    setOrganizationData(newData);
  };

  const handleFileUpload = (files: File[]) => {
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Document certification data:', formData);
    // TODO: Implement certification logic
  };

  return (
    <FormLayout 
      title="Certifica Documento"
      sidebar={
        <OrganizationData 
          data={organizationData}
          onUpdate={handleOrganizationUpdate}
        />
      }
    >
      <FormHeader title="Certifica Documento" onBack={onBack} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
                {/* Document Name */}
        <Input
          label="Nome Documento"
          placeholder="Inserisci il nome del documento"
          value={formData.documentName}
          onChange={(e) => handleInputChange('documentName', e.target.value)}
        />

        {/* Author Name */}
        <Input
          label="Nome Autore"
          placeholder="Inserisci il nome dell'autore"
          value={formData.authorName}
          onChange={(e) => handleInputChange('authorName', e.target.value)}
        />

        {/* Date */}
        <Input
          label="Data"
          placeholder="gg/mm/aa"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
        />

                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Tipologia
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="documentType"
                        value="tipologia"
                        checked={formData.documentType === 'tipologia'}
                        onChange={(e) => handleInputChange('documentType', e.target.value as 'tipologia' | 'altro')}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-white">Tipologia</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="documentType"
                        value="altro"
                        checked={formData.documentType === 'altro'}
                        onChange={(e) => handleInputChange('documentType', e.target.value as 'tipologia' | 'altro')}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-white">Altro</span>
                    </label>
                  </div>
                  
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
                </div>

                {/* File Upload */}
                <FileUpload
                  files={formData.files}
                  onFileUpload={handleFileUpload}
                  label="Carica"
                  description="Trascina qui il file o clicca per selezionare"
                  id="document-file-upload"
                />

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            onClick={onBack}
            variant="secondary"
          >
            Annulla
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Certifica
          </Button>
        </div>
              </form>
    </FormLayout>
  );
}; 