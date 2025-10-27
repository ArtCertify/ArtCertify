import React, { useState } from 'react';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { LoadingSpinner, ErrorMessage, Button } from './ui';
import { useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { IPFSUrlService } from '../services/ipfsUrlService';
import ModifyOrganizationModal from './modals/ModifyOrganizationModal';
import { 
  BuildingOfficeIcon, 
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  WalletIcon,
  CalendarIcon,
  PencilIcon
} from '@heroicons/react/24/outline';


export const OrganizationProfilePage: React.FC = () => {
  const { organizationData, loading, error: orgError, refreshOrganizationData } = useOrganization();
  const { userAddress } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);

  // Helper function to convert IPFS URL to gateway URL
  const getImageUrl = (ipfsUrl: string): string => {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return IPFSUrlService.getGatewayUrl(hash);
    }
    return ipfsUrl;
  };


  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </ResponsiveLayout>
    );
  }

  if (orgError) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorMessage 
            title="Errore nel caricamento dell'organizzazione"
            message={orgError}
            onRetry={refreshOrganizationData}
          />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!organizationData) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorMessage 
            title="Nessuna organizzazione trovata"
            message="Non è stato trovato alcun profilo organizzazione. Crea prima un profilo organizzazione."
            onRetry={refreshOrganizationData}
          />
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
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
    <ResponsiveLayout>
      <div className="space-y-8 relative pb-24">
        {/* Header with Organization Image and Info */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex flex-col md:flex-row lg:grid lg:grid-cols-3 gap-6 p-6">
            
            {/* Left: Organization Image */}
            <div className="md:flex-1 lg:col-span-1 bg-slate-900/50 p-6 flex items-center justify-center">
              {organizationData?.image ? (
                <div className="w-full">
                  <img
                    src={getImageUrl(organizationData.image)}
                    alt={organizationData.name}
                    className="w-full aspect-square object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-full aspect-square bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-slate-700 hidden">
                    <BuildingOfficeIcon className="w-16 h-16 text-slate-600" />
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-slate-700">
                  <BuildingOfficeIcon className="w-16 h-16 text-slate-600" />
                </div>
              )}
            </div>

            {/* Right: Organization Information */}
            <div className="md:flex-1 lg:col-span-2 space-y-6">
              <div className="relative">
                {/* Edit button in top right */}
                <div className="absolute top-0 right-0 flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsModifyModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Modifica
                  </Button>
                </div>
                
                {/* Date below edit button */}
                {organizationData?.rawData?.properties?.form_data?.timestamp && (
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                    <p className="text-slate-500 text-sm">
                      Creata il {new Date(organizationData.rawData.properties.form_data.timestamp).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                
                <h1 className="text-3xl font-bold text-white mb-2">
                  {organizationData?.name || 'Organizzazione'}
                </h1>
                <p className="text-slate-400 text-lg">
                  {organizationData?.type || 'Organizzazione'}
                </p>
                {organizationData?.description && (
                  <p className="text-slate-300 mt-4 leading-relaxed">
                    {organizationData.description}
                  </p>
                )}
              </div>

              {/* Wallet Address */}
              {userAddress && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <WalletIcon className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Wallet Connesso</span>
                  </div>
                  <p className="text-slate-400 text-sm font-mono break-all">
                    {userAddress}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organization Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Contact Information */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <EnvelopeIcon className="w-5 h-5" />
              Informazioni di Contatto
            </h2>
            <div className="space-y-4">
              {organizationData?.email && (
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white">{organizationData.email}</p>
                  </div>
                </div>
              )}
              {organizationData?.phone && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Telefono</p>
                    <p className="text-white">{organizationData.phone}</p>
                  </div>
                </div>
              )}
              {organizationData?.website && (
                <div className="flex items-center gap-3">
                  <GlobeAltIcon className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Sito Web</p>
                    <a 
                      href={organizationData.website.startsWith('http') ? organizationData.website : `https://${organizationData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {organizationData.website}
                    </a>
                  </div>
              </div>
              )}
              {organizationData?.address && (
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-4 h-4 text-slate-400" />
              <div>
                    <p className="text-sm text-slate-400">Indirizzo</p>
                    <p className="text-white">{organizationData.address}</p>
                  </div>
              </div>
              )}
            </div>
          </div>

          {/* Legal Information */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <IdentificationIcon className="w-5 h-5" />
              Informazioni Legali
            </h2>
            <div className="space-y-4">
              {organizationData?.vatNumber && (
                <div className="flex items-center gap-3">
                  <IdentificationIcon className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Partita IVA</p>
                    <p className="text-white font-mono">{organizationData.vatNumber}</p>
                  </div>
                </div>
              )}
              {organizationData?.type && (
                <div className="flex items-center gap-3">
                  <BuildingOfficeIcon className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Tipo di Organizzazione</p>
                    <p className="text-white">{organizationData.type}</p>
                  </div>
                </div>
              )}
              {organizationData?.city && (
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Città</p>
                    <p className="text-white">{organizationData.city}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modify Organization Modal */}
      <ModifyOrganizationModal
        isOpen={isModifyModalOpen}
        onClose={() => setIsModifyModalOpen(false)}
        organizationData={organizationData}
        onOrganizationUpdated={refreshOrganizationData}
      />
    </ResponsiveLayout>
  );
}; 