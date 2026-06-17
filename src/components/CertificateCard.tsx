import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IPFSUrlService } from '../services/ipfsUrlService';
import { algorandService } from '../services/algorand';
import type { AssetInfo } from '../services/algorand';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';

interface CertificateCardProps {
  asset: AssetInfo;
  loading?: boolean;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ asset, loading = false }) => {
  const [metadataUrl, setMetadataUrl] = useState<string | null>(null);
  const [creationDate, setCreationDate] = useState<number | null>(null);

  // Decode reserve address to get IPFS metadata URL
  React.useEffect(() => {
    if (asset.params?.reserve) {
      const result = IPFSUrlService.getReserveAddressUrl(asset.params.reserve);
      if (result.success && result.gatewayUrl) {
        setMetadataUrl(result.gatewayUrl);
      }
    }
  }, [asset.params?.reserve]);

  // Get creation date from block timestamp
  React.useEffect(() => {
    const fetchCreationDate = async () => {
      if (asset['created-at-round']) {
        try {
          const timestamp = await algorandService.getBlockTimestamp(Number(asset['created-at-round']));
          if (timestamp) {
            setCreationDate(timestamp);
          } else {
            // Fallback to approximate calculation
            const algorandGenesis = 1622505600; // June 1, 2021 00:00:00 UTC
            const avgBlockTime = 4.5;
            const roundNumber = Number(asset['created-at-round']);
            setCreationDate(algorandGenesis + (roundNumber * avgBlockTime));
          }
        } catch (error) {
          // Error fetching creation date - using fallback
          // Fallback to approximate calculation
          const algorandGenesis = 1622505600;
          const avgBlockTime = 4.5;
          const roundNumber = Number(asset['created-at-round']);
          setCreationDate(algorandGenesis + (roundNumber * avgBlockTime));
        }
      }
    };

    fetchCreationDate();
  }, [asset['created-at-round']]);

  const handleOpenMetadata = () => {
    if (metadataUrl) {
      // Apri direttamente l'URL gateway
      window.open(metadataUrl, '_blank', 'noopener,noreferrer');
    }
  };

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

  // Extract project name and certification name from title format "Project / File"
  const parseTitle = (title: string): { projectName: string; certificationName: string } => {
    if (!title) return { projectName: 'Sconosciuto', certificationName: 'Sconosciuto' };
    
    const parts = title.split(' / ');
    if (parts.length === 2) {
      return {
        projectName: parts[0].trim(),
        certificationName: parts[1].trim()
      };
    }
    
    // Fallback if format doesn't match
    return {
      projectName: 'Progetto',
      certificationName: title
    };
  };




  return (
    <Link to={`/asset/${asset.index}`} className="block">
      <div className="group relative bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-blue-500/50 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
          {/* Header with Title and Icon */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              {(() => {
                const title = asset.params?.name || `Asset ${asset.index}`;
                const { projectName, certificationName } = parseTitle(title);
                
                return (
                  <>
                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-blue-100 transition-colors">
                      {certificationName}
                    </h3>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                      {projectName}
                    </p>
                  </>
                );
              })()}
            </div>
            
            {/* Certification Icon - Matching ProjectCard style */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CheckBadgeIcon className="h-4 w-4 text-white" />
            </div>
          </div>

      {/* Key Metrics - Compact */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">ASSET ID</span>
          <span className="text-xs font-medium text-white group-hover:text-blue-100 transition-colors">
            #{asset.index}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">CREATED</span>
          <span className="text-xs font-medium text-white group-hover:text-blue-100 transition-colors">
            {creationDate ? formatDate(creationDate) : 'Caricamento...'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">METADATI</span>
          {metadataUrl ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenMetadata();
              }}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              IPFS link
            </button>
          ) : (
            <span className="text-xs text-slate-500">N/A</span>
          )}
        </div>
      </div>

      </div>
    </Link>
  );
}; 