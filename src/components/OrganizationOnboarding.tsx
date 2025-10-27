import React, { useState, useEffect } from 'react';
import { CloudArrowUpIcon, BuildingOfficeIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, IdentificationIcon, GlobeAltIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { usePeraCertificationFlow } from '../hooks/usePeraCertificationFlow';
import { Input, Textarea, Button, Alert } from './ui';
import { CertificationModal } from './modals/CertificationModal';
import { useOrganization } from '../contexts/OrganizationContext';

interface OrganizationOnboardingProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

interface OrganizationData {
  name: string;
  type: string;
  vatNumber: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  description: string;
  logo: string;
  logoFile: File | null;
}

const ORGANIZATION_TYPES = [
  { value: 'museo', label: 'Museo' },
  { value: 'galleria', label: 'Galleria d\'Arte' },
  { value: 'fondazione', label: 'Fondazione' },
  { value: 'associazione', label: 'Associazione' },
  { value: 'ente-pubblico', label: 'Ente Pubblico' },
  { value: 'privato', label: 'Collezionista Privato' },
  { value: 'altro', label: 'Altro' }
];

const OrganizationOnboarding: React.FC<OrganizationOnboardingProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState<OrganizationData>({
    name: '',
    type: '',
    vatNumber: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    description: '',
    logo: '',
    logoFile: null
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { 
    startCertificationFlow, 
    isModalOpen, 
    steps, 
    isProcessing, 
    result, 
    closeModal, 
    retryStep 
  } = usePeraCertificationFlow();

  const { refreshOrganizationData } = useOrganization();

  // Handle successful completion
  useEffect(() => {
    if (result && !isProcessing) {
      // Refresh organization data to update header
      refreshOrganizationData();
      
      // Call onSuccess to trigger refetch of certificates
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [result, isProcessing, onSuccess, refreshOrganizationData]);

  const handleInputChange = (field: keyof OrganizationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Campi obbligatori: Nome, Tipo, Descrizione
    if (!formData.name.trim()) {
      newErrors.name = 'Nome organizzazione è obbligatorio';
    } else if (formData.name.length > 27) {
      newErrors.name = 'Nome organizzazione deve essere massimo 27 caratteri';
    }
    
    if (!formData.type.trim()) {
      newErrors.type = 'Tipo organizzazione è obbligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrizione è obbligatoria';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Descrizione deve essere massimo 500 caratteri';
    }
    
    // Campi opzionali con validazione solo se compilati
    if (formData.vatNumber.trim() && (formData.vatNumber.length < 11 || formData.vatNumber.length > 11)) {
      newErrors.vatNumber = 'Partita IVA deve essere di 11 cifre';
    }
    
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website) && !/^www\..+/.test(formData.website)) {
      newErrors.website = 'Sito web deve iniziare con http://, https:// o www.';
    }
    
    if (formData.address.trim() && formData.address.length > 200) {
      newErrors.address = 'Indirizzo deve essere massimo 200 caratteri';
    }
    
    if (formData.city.trim() && formData.city.length > 50) {
      newErrors.city = 'Città deve essere massimo 50 caratteri';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Create NFT name with ORG: prefix
      const nftName = `ORG: ${formData.name}`;
      
      // Generate unit name (max 8 chars): "ORG" + first 4 of name
      const nameShort = formData.name.substring(0, 4).toUpperCase();
      const unitName = `ORG${nameShort}`.substring(0, 8);
      
      // Prepare files for IPFS upload
      const filesToUpload: File[] = [];
      if (formData.logoFile) {
        filesToUpload.push(formData.logoFile);
      }
      
      // Create certificationData exactly like certifications - same structure
      const certificationData = {
        asset_type: 'organizzazione',
        unique_id: `ORG_${Date.now()}`,
        title: nftName,
        author: formData.name,
        creation_date: new Date().toISOString(),
        organization: {
          name: formData.name,
          code: formData.type,
          type: formData.type,
          city: formData.city,
          vatNumber: formData.vatNumber,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          address: formData.address
        },
        technical_specs: {
          description: formData.description,
          file_name: formData.logoFile?.name || 'organization_logo',
          file_size: formData.logoFile?.size || 0,
          file_type: formData.logoFile?.type || 'image/png',
          file_extension: formData.logoFile?.name?.split('.').pop() || 'png',
          file_origin: formData.city
        }
      };
      
      // Create formData exactly like certifications - same structure as CertificationFormData
      const formDataForFlow = {
        fileName: formData.logoFile?.name || 'organization_logo',
        fileSize: formData.logoFile?.size || 0,
        fileType: formData.logoFile?.type || 'image/png',
        fileExtension: formData.logoFile?.name?.split('.').pop() || 'png',
        fileCreationDate: new Date().toISOString(),
        projectName: 'Organizzazione',
        assetName: nftName,
        unitName: unitName,
        fullAssetName: nftName,
        description: formData.description,
        fileOrigin: formData.city,
        type: 'organizzazione',
        customType: formData.type,
        vatNumber: formData.vatNumber,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        address: formData.address
      };
      
      // Start certification flow for organization NFT - EXACTLY like certifications
      await startCertificationFlow({
        certificationData,
        files: filesToUpload,
        assetName: nftName,
        unitName: unitName,
        formData: formDataForFlow
      });
      
      // Success - the stepper modal will show the progress
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Errore durante la creazione del profilo organizzazione');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        {/* Back button */}
        {onBack && (
          <div className="flex justify-start mb-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Indietro
            </button>
          </div>
        )}
        
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
        
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Logo Organizzazione
          </label>
          <div 
            className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            {formData.logo ? (
              <div className="space-y-2">
                <img 
                  src={formData.logo} 
                  alt="Logo preview" 
                  className="mx-auto h-20 w-20 object-cover rounded-lg"
                />
                <p className="text-xs text-slate-400">Clicca per cambiare logo</p>
              </div>
            ) : (
              <div>
                <CloudArrowUpIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-300">Clicca per caricare logo (opzionale)</p>
                <p className="text-xs text-slate-400">PNG, JPG fino a 10MB</p>
              </div>
            )}
            <input
              id="logo-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 10 * 1024 * 1024) {
                    setErrors(prev => ({ ...prev, logo: 'Il file deve essere inferiore a 10MB' }));
                    return;
                  }
                  setFormData(prev => ({ 
                    ...prev, 
                    logo: URL.createObjectURL(file),
                    logoFile: file
                  }));
                  if (errors.logo) {
                    setErrors(prev => ({ ...prev, logo: '' }));
                  }
                }
              }}
            />
          </div>
          {errors.logo && <p className="text-red-400 text-xs mt-1">{errors.logo}</p>}
        </div>

        {/* Organization Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={`Nome Organizzazione * (${formData.name.length}/27 caratteri)`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Es. Museo d'Arte Moderna"
            maxLength={27}
            leftIcon={<BuildingOfficeIcon className="h-4 w-4" />}
            error={errors.name}
          />

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tipo Organizzazione *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.type ? 'border-red-500' : 'border-slate-600'
              }`}
            >
              <option value="">Seleziona tipo</option>
              {ORGANIZATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={`Partita IVA (${formData.vatNumber.length}/11 cifre)`}
            value={formData.vatNumber}
            onChange={(e) => handleInputChange('vatNumber', e.target.value)}
            placeholder="Es. 12345678901"
            maxLength={11}
            leftIcon={<IdentificationIcon className="h-4 w-4" />}
            error={errors.vatNumber}
          />

          <Input
            label="Telefono"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Es. +39 02 1234567"
            leftIcon={<PhoneIcon className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="contatto@organizzazione.it"
            leftIcon={<EnvelopeIcon className="h-4 w-4" />}
            error={errors.email}
          />

          <Input
            label="Sito Web"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="www.organizzazione.it"
            leftIcon={<GlobeAltIcon className="h-4 w-4" />}
            error={errors.website}
          />
        </div>

        <Input
          label={`Indirizzo (${formData.address.length}/200 caratteri)`}
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Via dei Musei, 15, 00100 Roma RM"
          maxLength={200}
          leftIcon={<MapPinIcon className="h-4 w-4" />}
          error={errors.address}
        />

        <Input
          label={`Città (${formData.city.length}/50 caratteri)`}
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          placeholder="Es. Milano"
          maxLength={50}
          leftIcon={<MapPinIcon className="h-4 w-4" />}
          error={errors.city}
        />

        <Textarea
          label={`Descrizione * (${formData.description.length}/500 caratteri)`}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descrivi la tua organizzazione, la sua missione e le sue attività..."
          rows={4}
          maxLength={500}
          error={errors.description}
        />

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
            className="min-w-[280px]"
            icon={isSubmitting ? undefined : <BuildingOfficeIcon className="h-5 w-5" />}
          >
            {isSubmitting ? 'Creazione in corso...' : 'Crea Profilo Organizzazione'}
          </Button>
        </div>

        {/* Error Display */}
        {submitError && (
          <Alert variant="error" title="Errore durante la creazione">
            {submitError}
          </Alert>
        )}
      </div>

      {/* Stepper Modal */}
      <CertificationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        steps={steps}
        onRetryStep={retryStep}
        isProcessing={isProcessing}
        title="Creazione Profilo Organizzazione"
      />
    </div>
  );
};

export default OrganizationOnboarding;
