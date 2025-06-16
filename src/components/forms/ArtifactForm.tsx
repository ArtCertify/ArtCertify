import React, { useState } from 'react';
import { ChevronLeftIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import ResponsiveLayout from '../layout/ResponsiveLayout';

interface ArtifactFormProps {
  onBack: () => void;
}

type ArtifactType = 'artefatto-digitale' | 'video' | 'modello-3d' | 'altro';

interface ArtifactFormData {
  artifactType: ArtifactType;
  // Common fields
  uniqueId: string;
  title: string;
  author: string;
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
  // Files
  files: File[];
}

export const ArtifactForm: React.FC<ArtifactFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<ArtifactFormData>({
    artifactType: 'artefatto-digitale',
    uniqueId: '',
    title: '',
    author: '',
    creationDate: '',
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

  const [organizationData] = useState({
    name: 'Museo Arte',
    code: 'MA001',
    type: 'Museo',
    city: 'Roma'
  });

  const handleInputChange = (field: keyof ArtifactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Artifact certification data:', formData);
    // TODO: Implement certification logic
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
    <ResponsiveLayout title="Certifica Artefatto">
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
                <h2 className="text-xl font-semibold text-white">Certifica Artefatto</h2>
              </div>

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

                {/* Type-specific Fields */}
                {renderTypeSpecificFields()}

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Carica File
                  </label>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
                    <CloudArrowUpIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">Trascina qui i file o clicca per selezionare</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="artifact-file-upload"
                    />
                    <label
                      htmlFor="artifact-file-upload"
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