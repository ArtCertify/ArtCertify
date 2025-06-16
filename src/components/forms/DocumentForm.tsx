import React, { useState } from 'react';
import { ChevronLeftIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import ResponsiveLayout from '../layout/ResponsiveLayout';

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

  const [organizationData] = useState({
    name: 'Museo Arte',
    code: 'MA001',
    type: 'Museo',
    city: 'Roma'
  });

  const handleInputChange = (field: keyof DocumentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Document certification data:', formData);
    // TODO: Implement certification logic
  };

  return (
    <ResponsiveLayout title="Certifica Documento">
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Main Form - Scrollable */}
          <div className="lg:col-span-2 overflow-y-auto pr-2">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={onBack}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold text-white">Certifica Documento</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Document Name */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nome Documento
                  </label>
                  <input
                    type="text"
                    placeholder="Inserisci il nome del documento"
                    value={formData.documentName}
                    onChange={(e) => handleInputChange('documentName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Author Name */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nome Autore
                  </label>
                  <input
                    type="text"
                    placeholder="Inserisci il nome dell'autore"
                    value={formData.authorName}
                    onChange={(e) => handleInputChange('authorName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Data
                  </label>
                  <input
                    type="text"
                    placeholder="gg/mm/aa"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

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
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Carica
                  </label>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
                    <CloudArrowUpIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">Trascina qui il file o clicca per selezionare</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-blue-400 hover:text-blue-300 underline"
                    >
                      Seleziona file
                    </label>
                  </div>
                </div>

                {/* Associated Files */}
                {formData.files.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      File associati
                    </label>
                    <div className="space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-white">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Certifica
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Organization Data Sidebar - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Dati Organizzazione
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Nome</span>
                  <span className="text-blue-400 font-medium">{organizationData.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Codice</span>
                  <span className="text-blue-400 font-medium">{organizationData.code}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tipo</span>
                  <span className="text-blue-400 font-medium">{organizationData.type}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Città</span>
                  <span className="text-blue-400 font-medium">{organizationData.city}</span>
                </div>
              </div>
              
              <button className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Modifica
              </button>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}; 