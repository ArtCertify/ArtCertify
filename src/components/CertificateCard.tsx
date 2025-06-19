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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-slate-600 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-600 rounded w-32 mb-1"></div>
              <div className="h-3 bg-slate-600 rounded w-20"></div>
            </div>
          </div>
          <div className="w-12 h-5 bg-slate-600 rounded"></div>
        </div>
        
        <div className="mb-3 p-2 bg-slate-700/50 rounded">
          <div className="h-3 bg-slate-600 rounded w-16 mb-1"></div>
          <div className="h-3 bg-slate-600 rounded w-full"></div>
        </div>
        
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

  // Get the certificate type based on asset properties
  const getCertificateType = () => {
    if (asset.params.name?.toLowerCase().includes('document')) return 'Documento';
    if (asset.params.name?.toLowerCase().includes('artefatto')) return 'Artefatto';
    if (asset.params.name?.toLowerCase().includes('sbt')) return 'SBT';
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
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-900/30 rounded flex items-center justify-center">
            <DocumentTextIcon className="h-4 w-4 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-white truncate">
              {asset.params.name || `Asset ${asset.index}`}
            </h3>
            <p className="text-xs text-slate-500">
              {formatDate(creationDate)}
            </p>
          </div>
        </div>
        
        <Badge variant={status.color} className="text-xs">
          {certificateType}
        </Badge>
      </div>

      {/* CID Info - Minimal */}
      {asset.currentCidInfo && (asset.currentCidInfo as any).success && (
        <div className="mb-3 p-2 bg-slate-700/50 rounded text-xs">
          <p className="text-slate-400 mb-1">CID IPFS</p>
          <p className="text-slate-300 font-mono truncate">
            {(asset.currentCidInfo as any).cid}
          </p>
        </div>
      )}

      {/* Actions */}
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