import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Badge } from './ui';
import type { AssetInfo } from '../services/algorand';

interface CertificateCardProps {
  asset: AssetInfo;
  loading?: boolean;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ asset, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 animate-pulse">
        {/* Badge at top */}
        <div className="flex justify-between items-start mb-3">
          <div className="w-16 h-5 bg-slate-600 rounded"></div>
            <div className="w-8 h-8 bg-slate-600 rounded"></div>
        </div>
        
        {/* Title and date */}
        <div className="mb-4">
          <div className="h-5 bg-slate-600 rounded w-40 mb-2"></div>
          <div className="h-3 bg-slate-600 rounded w-24"></div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="h-3 bg-slate-600 rounded w-12"></div>
          <div className="w-20 h-6 bg-slate-600 rounded"></div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'Non disponibile';
    
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return 'Data non valida';
    
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get creation date from creation transaction or asset creation round
  const creationTransaction = asset.creationTransaction as any;
  let creationDate = creationTransaction?.roundTime || 
                    creationTransaction?.['round-time'] || 
                    creationTransaction?.confirmedRound || 
                    creationTransaction?.['confirmed-round'];
  
  if (!creationDate && asset['created-at-round']) {
    const algorandGenesis = 1560211200;
    const avgBlockTime = 4.5;
    creationDate = algorandGenesis + (Number(asset['created-at-round']) * avgBlockTime);
  }

  // Get the certificate type from NFT metadata
  const getCertificateType = () => {
    // 1. Prova da certification_data.asset_type (metodo principale)
    if (asset.nftMetadata?.certification_data?.asset_type) {
      const assetType = asset.nftMetadata.certification_data.asset_type.toLowerCase();
      if (assetType === 'document') return 'Documento';
      // Tutti i tipi di artefatto vengono mappati ad "Artefatto"
      if (assetType.includes('artefatto') || assetType === 'artifact' || 
          assetType === 'video' || assetType === 'modello-3d' || 
          assetType === 'artefatto-digitale' || assetType === 'altro') {
        return 'Artefatto';
      }
    }

    // 2. Prova da attributes "Asset Type" trait
    if (asset.nftMetadata?.attributes) {
      const assetTypeAttr = asset.nftMetadata.attributes.find(
        attr => attr.trait_type === 'Asset Type' || attr.trait_type === 'Tipo Certificazione'
      );
      if (assetTypeAttr) {
        const value = String(assetTypeAttr.value).toLowerCase();
        if (value === 'document' || value === 'documento') return 'Documento';
        if (value.includes('artefatto') || value === 'artifact' || 
            value === 'video' || value === 'modello-3d' || 
            value === 'artefatto-digitale' || value === 'altro') {
          return 'Artefatto';
        }
      }
    }

    // 3. Fallback al nome (per retrocompatibilità)
    if (asset.params.name) {
      const name = asset.params.name.toLowerCase();
      if (name.includes('document') || name.includes('doc')) return 'Documento';
      if (name.includes('artefatto') || name.includes('artifact') || 
          name.includes('video') || name.includes('modello') || 
          name.includes('sbt')) return 'Artefatto';
    }

    // 4. Default intelligente basato su unit name
    if (asset.params.unitName) {
      const unitName = asset.params.unitName.toLowerCase();
      if (unitName.includes('doc')) return 'Documento';
      if (unitName.includes('art') || unitName.includes('sbt') || unitName.includes('cert')) return 'Artefatto';
    }

    // 5. Default: preferisce Documento per retrocompatibilità
    return 'Documento';
  };

  // Get status based on asset state
  const getStatus = () => {
    if (asset['deleted-at-round']) return { text: 'Eliminato', color: 'error' as const };
    if (asset.params.defaultFrozen) return { text: 'Congelato', color: 'warning' as const };
    return { text: 'Attivo', color: 'success' as const };
  };

  const status = getStatus();
  const certificateType = getCertificateType();

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors">
      {/* Top Row: Badge + Icon */}
      <div className="flex justify-between items-start mb-3">
        <Badge variant={status.color} className="text-xs">
          {certificateType}
        </Badge>
          <div className="w-8 h-8 bg-blue-900/30 rounded flex items-center justify-center">
            <DocumentTextIcon className="h-4 w-4 text-blue-400" />
          </div>
      </div>

      {/* Content: Title and Date */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white mb-1 leading-tight">
              {asset.params.name || `Asset ${asset.index}`}
            </h3>
            <p className="text-xs text-slate-500">
              {formatDate(creationDate)}
            </p>
        </div>
        
      {/* Bottom Row: ID + Action */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-slate-500">
          ID: {asset.index}
        </div>
        
        <Link
          to={`/asset/${asset.index}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
        >
          <EyeIcon className="h-3 w-3" />
          Visualizza
        </Link>
      </div>
    </div>
  );
}; 