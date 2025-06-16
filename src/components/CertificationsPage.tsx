import React, { useState } from 'react';
import { DocumentTextIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { DocumentForm } from './forms/DocumentForm';
import { ArtifactForm } from './forms/ArtifactForm';

type CertificationType = 'document' | 'artifact' | null;

export const CertificationsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<CertificationType>(null);

  const handleTypeSelection = (type: CertificationType) => {
    setSelectedType(type);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  if (selectedType === 'document') {
    return <DocumentForm onBack={handleBack} />;
  }

  if (selectedType === 'artifact') {
    return <ArtifactForm onBack={handleBack} />;
  }

  return (
    <ResponsiveLayout title="Nuova Certificazione">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            Cosa vuoi certificare?
          </h1>
          <p className="text-slate-400 text-lg">
            Scegli il tipo di elemento che desideri certificare
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Document Card */}
          <button
            onClick={() => handleTypeSelection('document')}
            className="group bg-slate-800 rounded-xl border border-slate-700 p-8 hover:border-blue-500 hover:bg-slate-750 transition-all duration-200 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-900/50 transition-colors">
                <DocumentTextIcon className="h-10 w-10 text-blue-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-4">
                Documento
              </h3>
              
              <p className="text-slate-400 leading-relaxed">
                Certifica documenti legali, contratti, bolle e altri documenti ufficiali per garantire l'autenticità e la provenienza.
              </p>
            </div>
          </button>

          {/* Artifact Card */}
          <button
            onClick={() => handleTypeSelection('artifact')}
            className="group bg-slate-800 rounded-xl border border-slate-700 p-8 hover:border-blue-500 hover:bg-slate-750 transition-all duration-200 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-900/50 transition-colors">
                <PaintBrushIcon className="h-10 w-10 text-purple-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-4">
                Artefatto
              </h3>
              
              <p className="text-slate-400 leading-relaxed">
                Certifica opere digitali, modelli 3D, video, esperienze interattive e altri artefatti culturali e artistici.
              </p>
            </div>
          </button>
        </div>
      </div>
    </ResponsiveLayout>
  );
}; 