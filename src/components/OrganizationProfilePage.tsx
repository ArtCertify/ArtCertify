import React, { useState } from 'react';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { LoadingSpinner, ErrorMessage, Button, SectionCard, Input, Textarea } from './ui';
import { 
  BuildingOfficeIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

interface OrganizationProfile {
  name: string;
  type: string;
  vatNumber: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  description: string;
  logo?: string;
}

const initialProfile: OrganizationProfile = {
  name: 'Museo Nazionale di Arte Contemporanea',
  type: 'Museo',
  vatNumber: '12345678901',
  phone: '+39 06 1234567',
  email: 'info@museonazionale.it',
  website: 'www.museonazionale.it',
  address: 'Via dei Musei, 15, 00100 Roma RM',
  description: 'Il Museo Nazionale di Arte Contemporanea è un\'istituzione dedicata alla conservazione e valorizzazione dell\'arte moderna e contemporanea italiana ed internazionale.'
};

export const OrganizationProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<OrganizationProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<OrganizationProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore durante il salvataggio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrganizationProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderField = (
    field: keyof OrganizationProfile,
    label: string,
    icon: React.ReactNode,
    placeholder?: string,
    isTextarea = false
  ) => {
    const value = isEditing ? editedProfile[field] : profile[field];
    
    if (isEditing) {
      return isTextarea ? (
        <Textarea
          label={label}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <Input
          label={label}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          leftIcon={icon}
        />
      );
    }

    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          {icon}
          {label}
        </label>
        <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 min-h-[40px] flex items-center">
          {value || <span className="text-slate-500">Non specificato</span>}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <ResponsiveLayout title="Profilo Organizzazione">
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorMessage 
            message={error}
            onRetry={() => setError(null)}
          />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout title="Profilo Organizzazione">
      <div className="space-y-6">
        {/* Description and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-slate-400 text-sm">
            Gestisci le informazioni della tua organizzazione
          </p>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Annulla
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <CheckIcon className="h-4 w-4" />
                  )}
                  Salva
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Modifica
              </Button>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <SectionCard>
          {/* Logo Section */}
          <div className="p-6 bg-slate-900 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-700 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="h-10 w-10 text-slate-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
                <p className="text-slate-400">{profile.type}</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderField(
                'name',
                'Nome Organizzazione',
                <BuildingOfficeIcon className="h-4 w-4" />,
                'Inserisci il nome dell\'organizzazione'
              )}

              {renderField(
                'type',
                'Tipo Organizzazione',
                <IdentificationIcon className="h-4 w-4" />,
                'Es. Museo, Università, Ente Pubblico'
              )}

              {renderField(
                'vatNumber',
                'Partita IVA',
                <IdentificationIcon className="h-4 w-4" />,
                'Es. 12345678901'
              )}

              {renderField(
                'phone',
                'Telefono',
                <PhoneIcon className="h-4 w-4" />,
                'Es. +39 06 1234567'
              )}

              {renderField(
                'email',
                'Email',
                <EnvelopeIcon className="h-4 w-4" />,
                'Es. info@organizzazione.it'
              )}

              {renderField(
                'website',
                'Sito Web',
                <GlobeAltIcon className="h-4 w-4" />,
                'Es. www.organizzazione.it'
              )}
            </div>

            {renderField(
              'address',
              'Indirizzo',
              <MapPinIcon className="h-4 w-4" />,
              'Inserisci l\'indirizzo completo'
            )}

            {renderField(
              'description',
              'Descrizione',
              <BuildingOfficeIcon className="h-4 w-4" />,
              'Descrivi la tua organizzazione e le sue attività...',
              true
            )}
          </div>
        </SectionCard>

        {/* Additional Information */}
        <SectionCard 
          title="Informazioni Aggiuntive"
          icon={<BuildingOfficeIcon className="h-5 w-5" />}
        >
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              • Le informazioni del profilo verranno utilizzate per identificare la tua organizzazione 
              nelle certificazioni digitali.
            </p>
            <p>
              • I dati sono protetti e utilizzati esclusivamente per scopi di certificazione.
            </p>
            <p>
              • Assicurati che tutte le informazioni siano accurate e aggiornate.
            </p>
          </div>
        </SectionCard>
      </div>
    </ResponsiveLayout>
  );
}; 